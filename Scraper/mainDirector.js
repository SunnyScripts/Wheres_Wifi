/**
 * Created by Ryan Berg on 12/24/14.
 * rberg2@hotmail.com
 *
 * -Synopsis-
 *  create url requests at random intervals with city data
 *  send request to proxy
 *
 *  Arguments:
 *
 *  node filename.js <[what proxies to use?] local [localhost], internal[local in cloud, is default]> <proxyPort || databaseIP> <databaseIP>
 */

    //TODO: simplify file arguments, use flags? man page?

 // Initialize Global Variables \\
//===============================\\

var mongojs = require('mongojs');
var request = require('request');

var proxyPort = 8000;
var databaseIP = '10.240.212.83';//internal

if(process.argv[3])
{
    if(process.argv[3].length == 4)
    {
        proxyPort = process.argv[3];
    }
    else
    {
        databaseIP = process.argv[3];
    }
}

if(process.argv[4])
{
    databaseIP = process.argv[4];
}


var db = mongojs(databaseIP+ ':7000/Wheres_Wifi', ['cities', 'userAgents']);

//node mainDirector.js <internal, external, local> <proxyPort> <databaseIP>

//between 100 to 200 requests are made, then an idle runs 9 to 28 minutes
var requestCounter = 0;
var requestMaximum = createWholeRandomNumberWith(100, 200);

//count for each rank (0 - 6) in the user agent database
var randomRankCountArray = [23, 47, 36, 31, 45, 12, 6];
//choosing an index for this array at random has a probability of [.05,.05,.1,.1,.15,.25,.3]
var userAgentProbabilityArray = [ 0, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6 ];

//each business has a unique random number
//the shuffledNumberArray is a list of random numbers
//which is iterated through according to the incremented numberArrayCurrentIndex, so no random number is picked twice
//then a matching randomNumber is looked for in the database, plus or minus 15
var numberArrayCurrentIndex = 0; 
const numberArrayMaxSize = 37550;
var shuffledNumberArray = createShuffledNumberArrayWithSize(numberArrayMaxSize);


 // Timers \\
//==========\\


//every 5 minutes the number of cities left to be scraped is checked
checkDatabaseCompletionCount();

function checkDatabaseCompletionCount()
{
    db.cities.find({'isLogCompleted':false}).count(function(error, databaseCount)
    {
        console.log(databaseCount + ' cities left to scrape');

        if(databaseCount === 0)
        {
            throw Error('no cities left to scrape');
        }
    });
}

databaseCountTimer();

function databaseCountTimer()
{
    setTimeout(function()
    {
        checkDatabaseCompletionCount();
        databaseCountTimer();
    }, minutesToMilliseconds(5));
}

function mainTimer()
{
    //TODO: put this somewhere else and explain
    if(numberArrayCurrentIndex > numberArrayMaxSize)
    {
        numberArrayCurrentIndex = 0;
    }

    if(requestCounter < requestMaximum)
    {
        setTimeout(function()
        {
            //each request is made in 6 1/2 to 11 second intervals
            requestCounter ++;
            main();
        }, createWholeRandomNumberWith(6500, 11000));
    }
    else
    {
        console.log('idle timer active');

        setTimeout(function()
        {
            requestCounter = 0;
            requestMaximum = createWholeRandomNumberWith(100, 200);
            console.log('run main timer');
            mainTimer();
        }, createWholeRandomNumberWith(minutesToMilliseconds(9), minutesToMilliseconds(28)));
    }

}


   //                         \\
  //       Main Function       \\
 //=============================\\
//                               \\


main();

function main()
{
    //get random city from city database
    db.cities.findOne({'isLogCompleted': false, $and: [{'randomNumber': {$gte: shuffledNumberArray[numberArrayCurrentIndex] - 15}}, {'randomNumber': {$lte: shuffledNumberArray[numberArrayCurrentIndex] + 15}}]}, function(error, cityObject)
    {
        if(error) { console.log(error); }

        if(cityObject)
        {
            console.log(cityObject);

            buildRequestOptionsFrom(cityObject);
            mainTimer();
        }
        else
        {
            db.cities.findOne({'isLogCompleted': false}, function(error, altCityObject)
            {
                if(altCityObject)
                {
                    console.log(altCityObject);

                    buildRequestOptionsFrom(altCityObject);
                    mainTimer();
                }
                else
                {
                    throw Error('no city object found');
                }
            });
        }



    });
    numberArrayCurrentIndex++;
}

function buildRequestOptionsFrom(cityObject)
{
    var requestURLString = 'http://www.yelp.com/search?attrs=WiFi.free&l=p:' + cityObject.state + ':' + cityObject.city + '::';
    var requestOptions = {};


    if(cityObject.userAgent)//business already exists
    {
        requestURLString = requestURLString + '&start=' + (cityObject.lastPageRequest * 10);

        requestOptions =
        {
            uri: cityObject.proxyURL,
            body:
            {
                'requestURL': requestURLString,
                'cityObject': cityObject
            },
            method: 'POST',
            json: true
        };

        makeRequestWithOptions(requestOptions);
    }
    else//no business data
    {

        //when a random index is chosen for the user agent probability array,
        //the probability for any random rank matches the probability array
        //probabilityArray = [.05,.05,.1,.1,.15,.25,.3];
        var randomRank = userAgentProbabilityArray[createWholeRandomNumberWith(0, userAgentProbabilityArray.length - 1)];
        //each 'random rank' has its own set of random numbers
        var randomNumber =  createWholeRandomNumberWith(0, randomRankCountArray[randomRank] - 1);


        //get the user agent from the database
        db.userAgents.findOne({'randomRank': randomRank, 'randomNumber':randomNumber}, function(error, userAgentObject)
        {
            if(error) { throw error; }

            cityObject.userAgent = userAgentObject._id;
            var proxyURL = 'http://' + getARandomProxyIP() + ':' + proxyPort;

            db.cities.update({'_id': cityObject._id}, {$set: {'userAgent': cityObject.userAgent, 'proxyURL': proxyURL}}, function(error)
            {
                if(error) { throw error; }
            });

            requestOptions =
            {
                uri: proxyURL,
                body:
                {
                    'requestURL': requestURLString,
                    'cityObject': cityObject
                },
                method: 'POST',
                json: true
            };

            makeRequestWithOptions(requestOptions);
        });
    }
}




 // Utility Functions \\
//=====================\\

function makeRequestWithOptions(options)
{
    //console.log('options:\n'+JSON.stringify(options));

    request(options, function (error, response)
    {
        //TODO: more gracefully handle errors?
        if(error) { throw error; }
        //TODO: handle internal proxy errors, response.statusCode
    });
}

function minutesToMilliseconds(minutes)
{
    return minutes * 60 * 1000;
}

function createWholeRandomNumberWith(minimumValue, maximumValue)
{
    return Math.floor(Math.random()*(maximumValue - minimumValue + 1) + minimumValue);
}

function getARandomProxyIP()
{
    if(process.argv[2] === 'local')
    {
        return 'localhost';
    }
    else //default action, internal
    {
        switch(createWholeRandomNumberWith(0, 2))
        {
            case 0:
                return '10.240.175.93';
            case 1:
                return '10.240.98.58';
            default:
                return '10.240.7.5';
        }
    }
}

function createShuffledNumberArrayWithSize(arraySize)
{
    var array = new Array(arraySize);

    for(var i = 0; i < array.length; i++)
    {
        array[i] = i;
    }

    //Credit: Fisher–Yates Shuffle
    //Credit: Javascript by, Mike Bostock
    var m = array.length, t;

    // While there remain elements to shuffle…
    while (m)
    {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}