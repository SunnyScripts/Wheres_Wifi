/**
 * Created by Ryan Berg on 12/24/14.
 * rberg2@hotmail.com
 */


var fs = require('fs');
var mongojs = require('mongojs');

var db = mongojs('###.###.###.###/Wheres_Wifi', ['cities']);

var doneCount = 0;
var duplicateErrorString = '';

fs.readFile('cityList.json', 'utf8', function(error, data)
{
    if (error) { throw error;}

    var citiesArray = JSON.parse(data);
    const citiesArrayCount = citiesArray.length;
    var randomNumberArray = new Array(citiesArrayCount);

    for(var i = 0; i < randomNumberArray.length; i++)
    {
        randomNumberArray[i] = i;
    }

    randomNumberArray = shuffleTheArray(randomNumberArray);

    for(i = 0; i < citiesArrayCount; i++)
    {
        var cityObject =
        {
            '_id': citiesArray[i].city + ',' + citiesArray[i].state,
            'randomNumber': randomNumberArray[i],
            'city': citiesArray[i].city,
            'state': citiesArray[i].state,
            'isLogCompleted': false,
            'dateLogCompleted': null,
            'proxyIP': null,
            'lastPageRequest': null
        };

        if(cityObject)
        {
            db.cities.insert(cityObject, function(error)
            {
                //skip duplicates
                if(error)
                {
                    duplicateErrorString += error + '\n';
                }

                doneCount++;

                console.log(doneCount / citiesArrayCount);

                if(doneCount / citiesArrayCount == 1)
                {
                    writeDataToFile(duplicateErrorString, 'duplicateCityError.log');
                    console.log('finished insert, check duplicateCityErrorLog for errors');
                }
            });
        }

    }

});

function shuffleTheArray(array)
{
    //Credit: Fisher–Yates Shuffle
    //Credit: Javascript by, Mike Bostock

    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

function writeDataToFile(data, fileName)
{
    fs = require('fs');

    fs.writeFile(fileName, data, function(error)
    {
        if(error) { throw error; }
    });
}