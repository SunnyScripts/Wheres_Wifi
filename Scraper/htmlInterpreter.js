/**
 * Version 1.0.0
 *
 * Created by Ryan Berg on 12/9/14.
 * rberg2@hotmail.com
 *
 *
 * -Synopsis-
 *  parses html to json, sets business documents to database, and updates the cities database
 *
 *  Arguments:
 *
 * node fileName.js <listeningPort [default 9000] || String(databaseIP), external, internal[default]>
 */

const cityRequestLimit = 25;

var http = require('http');
var mongojs = require('mongojs');

var databaseIP = '10.240.212.83';//internal ip
const databasePort = 7000;

var listeningPort = 9000;


if(process.argv[2])
{
    if(process.argv[2] === 'external')
    {
        databaseIP = '146.148.81.137';
    }
    else if(process.argv[2].length > 4)
    {
        databaseIP = process.argv[2];
    }
    else if(process.argv[2].length == 4)
    {
        listeningPort = Number(process.argv[2]);
    }
}

if(process.argv[3])
{
    listeningPort = Number(process.argv[3]);
}


var db = mongojs(databaseIP + ':' + databasePort + '/Wheres_Wifi', ['businesses', 'cities']);


http.createServer(function(request, response)
{
    var body = '';

    request.on('data', function(dataChunk)
    {
        body += dataChunk;
    });

    request.on('end', function ()
    {
        response.writeHead(200);
        response.end();

        parseHtml(body);
    });

}).listen(listeningPort);
console.log('interpreter listening on port: ' + listeningPort);
console.log('sending inserts to the database on IP: ' + databaseIP);


function parseHtml(body)
{
    var json = JSON.parse(body);

    var cityObject = json.cityObject;
    var htmlData = json.htmlData;

    json = null;

    //find how many pages are available and what page we are on
    var pageCountMatchArray = htmlData.match(/Page \d{1,2} of \d+/g);
    console.log('pages available: ' + pageCountMatchArray + ' in ' + cityObject._id);

    if(pageCountMatchArray)//page has results
    {
        var pageCount = Number(pageCountMatchArray[0].replace(/Page \d{1,2} of /, /*with*/''));
        var currentPage = Number(pageCountMatchArray[0].match(/\d{1,2}/)[0]);

        if(currentPage == cityRequestLimit)//limit requests
        {
            //setting pageCount to 0 sets the city as complete
            updateCityObject(cityObject._id, 0, currentPage)
        }
        else
        {
            updateCityObject(cityObject._id, pageCount, currentPage);
        }

        var scrapedJSONArray = 3;

        db.businesses.insert(putBusinessAttributesIntoJSONFormatFrom(htmlData, cityObject.city, cityObject.state), {continueOnError: true, safe: true}, function(error)
        {
            if(error)
            {
                console.log('\n\n\nError:\n\n\n' + error); //TODO: use this change in finding lost data
            }
        });
    }
    else//no results for city
    {
        updateCityObject(cityObject._id, 0, 0);
    }
}

function updateCityObject(cityObjectID, pageCount, currentPageRequest)
{
    if(pageCount < 2 || pageCount - currentPageRequest == 0)
    {
        db.cities.update({'_id': cityObjectID}, {$set: {'isLogCompleted': true, 'dateLogCompleted': new Date().toISOString(), 'lastPageRequest': currentPageRequest}}, function(error)
        {
            if(error) { throw error; }
        });
    }
    else
    {
        db.cities.update({'_id': cityObjectID}, {$set: {'lastPageRequest': currentPageRequest}}, function(error)
        {
            if(error) { throw error; }
        });
    }
}



function putBusinessAttributesIntoJSONFormatFrom(htmlData, city, state)//returns array of objects
{
    //bloated array will contain all matches with some extra around the edges
    //find and replace trims each entry in the bloated array
    //and finally, a for loop organizes the arrays into json

    var bloatedArray = htmlData.match(/\d\.[^<]*<a class="biz-name"[\s\S]*?<\/a>/g);
    var closedArray = findAndReplaceWith(/CLOSED|MOVED/, bloatedArray);

    // id and name \\
    var idArray = findAndReplaceWith(/biz\/[^"]*/, bloatedArray, 'biz/');
    var nameArray = findAndReplaceWith(/>[^<]*/, bloatedArray, '>');


    //phone number\\
    bloatedArray = htmlData.match(/biz-phone">[\s\S]*?</g);
    var phoneNumberArray = findAndReplaceWith(/\(\d{3}\) \d{3}-\d{4}/, bloatedArray);

    // category \\
    bloatedArray = htmlData.match(/class="category-str-list">[\s\S]*?<\/span>/g);
    var categoryArray = findAndReplaceWith(/[a-zA-Z &amp;()]*<\/a/g, bloatedArray, '</a', null, true);


    // address \\
    bloatedArray = htmlData.match(/([A-Z]|[0-9])[^<]*<br>[^\d]*\d*/g);
    var zipCodeArray = findAndReplaceWith(/>[\S\s]*/, bloatedArray, /\D*/);
    var addressArray = findAndReplaceWith(/[\s\S]*/, bloatedArray, '<br>', ', ');
    var streetNameArray = findAndReplaceWith(/[^,]+/, addressArray);


    // latitude and longitude \\
    bloatedArray = htmlData.match(/location":\D*\d*.\d*\D*\d*.\d*/g);
    var latitudeArray = findAndReplaceWith(/latitude": -*\d*.\d*/, bloatedArray, 'latitude": ');
    var longitudeArray = findAndReplaceWith(/longitude": -*\d*.\d*/, bloatedArray, 'longitude": ');


     // Create business objects \\
    //===========================\\

    var numberOfBusinesses = bloatedArray.length;

    //cleanup of memory before entering for loop
    htmlData = null;
    bloatedArray = null;

    var businessObjectArray = [];

    for(i = 0; i < numberOfBusinesses; i++)
    {
        if(closedArray[i] === null)
        {
            var businessObject =
            {
                _id: idArray[i],
                name: nameArray[i],
                phoneNumber: phoneNumberArray[i],
                category: categoryArray[i],
                address:
                {
                    fullAddress: addressArray[i],
                    street: streetNameArray[i],
                    city: city,
                    state: state,
                    zip: zipCodeArray[i]
                },
                latitude: Number(latitudeArray[i]),
                longitude: Number(longitudeArray[i]),
                ratingCount: 0,
                ratingAverage: null
            };

            businessObjectArray.push(businessObject);
        }
    }
    return businessObjectArray;
}


 // Utility Functions \\
//=====================\\

//TODO: describe arguments
function findAndReplaceWith(matchRegex, searchArray, replaceRegex, replacementString, isReturnValueAnArrayOfArrays)
{
    var attributeArray = [];
    var businessString = '';
    var regexMatchArray = [];

    if(!replacementString)
    {
        replacementString = '';
    }

    if(searchArray)
    {
        for (var i = 0; i < searchArray.length; i++)
        {
            regexMatchArray = searchArray[i].match(matchRegex);


            if (regexMatchArray)//a match was found
            {
                if (!isReturnValueAnArrayOfArrays)//push string to array
                {
                    if (replaceRegex)
                    {
                        businessString = regexMatchArray[0].replace(replaceRegex, replacementString);
                    }
                    else
                    {
                        businessString = regexMatchArray[0];
                    }
                    attributeArray.push(decodeURI(businessString));
                }
                else//push array to array
                {
                    for (var j = 0; j < regexMatchArray.length; j++)
                    {
                        regexMatchArray[j] = regexMatchArray[j].replace(replaceRegex, replacementString);
                        regexMatchArray[j] = regexMatchArray[j].replace(/&amp;/, '&');
                    }
                    attributeArray.push(regexMatchArray);
                }
            }
            else//no match found
            {
                attributeArray.push(null);
            }
        }
    }
    return attributeArray;
}