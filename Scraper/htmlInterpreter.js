/**
 * Created by Ryan Berg on 12/9/14.
 * rberg2@hotmail.com
 *
 * htmlInterpreter.js parses html to json, sets business database documents, and updates the cities database
 *
 */

    //TODO: add more commenting for clarity

var http = require('http');
var mongojs = require('mongojs');

var db = mongojs('###.###.###.###/Wheres_Wifi', ['businesses', 'cities']);


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
        console.log('request received');
        response.end();

        console.log(body);
        parseHtml(body);
    });

}).listen(8888);
console.log('interpreter listening on port 8888');


function parseHtml(body)
{
    var json = JSON.parse(body);

    var cityObject = json.cityObject;
    var htmlData = json.htmlData;

    //console.log(putBusinessAttributesIntoJSONFormatFrom(htmlData, cityObject.city, cityObject.state));

    //find available pages in htmlData
    var pageCountMatchArray = htmlData.match(/Page 1 of \d*/g);

    if(pageCountMatchArray)//page has results
    {
        var pageCount = Number(pageCountMatchArray[0].replace('Page 1 of ', /*with*/''));

        updateCityObject(cityObject._id, pageCount, cityObject.lastPageRequest + 1);

        db.businesses.insert(putBusinessAttributesIntoJSONFormatFrom(htmlData, cityObject.city, cityObject.state), function(error)
        {
            if(error) { throw error; }
        });
    }
    else//no results for city
    {
        updateCityObject(cityObject._id, 0, 0);
    }
}

function updateCityObject(cityObjectID, pagesAvailable, currentPageRequest)
{
    if(pagesAvailable < 2 || pagesAvailable - currentPageRequest == 0)
    {
        db.cities.update({'_id': cityObjectID}, {$set: {'isLogCompleted': true, 'dateLogCompleted': new Date(), 'lastPageRequest': currentPageRequest}}, function(error)
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



function putBusinessAttributesIntoJSONFormatFrom(htmlData, city, state)
{
    //bloated array will contain all matches with some extra around the edges
    //find and replace trims each entry in the bloated array
    //and finally, a for loop organizes the arrays into json

    var bloatedArray = htmlData.match(/class="biz-name"[\s\S]*?<\/a>/g);
    var closedArray = findAndReplaceWith(/CLOSED/, bloatedArray);

    // id and name \\
    var idArray = findAndReplaceWith(/biz\/[^"]*/, bloatedArray, 'biz/');
    var nameArray = findAndReplaceWith(/>[^<]*/, bloatedArray, '>');


    //phone number\\
    bloatedArray = htmlData.match(/biz-phone">[\s\S]*?</g);
    var phoneNumberArray = findAndReplaceWith(/\(\d{3}\) \d{3}-\d{4}/, bloatedArray);

    // category \\
    bloatedArray = htmlData.match(/class="category-str-list">[\s\S]*?<\/span>/g);
    var categoryArray = findAndReplaceWith(/[a-zA-Z &]*<\/a/g, bloatedArray, '</a', null, true);

    // address \\
    bloatedArray = htmlData.match(/([A-Z]|[0-9])[^<]*<br>[^\d]*\d*/g);
    var addressArray = findAndReplaceWith(/[\s\S]*/, bloatedArray, '<br>', ', ');
    var streetNameArray = findAndReplaceWith(/[^,]+/, addressArray);
    var zipCodeArray = findAndReplaceWith(/\d{5}/, addressArray);


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
                //TODO: break world map into tiles base on zoom level
                //TODO: remove or update all old entries that don't follow the new pattern
            };

            businessObjectArray.push(businessObject);
        }
    }
    console.log('Array Count: ' + businessObjectArray.length);
    return businessObjectArray;
}


 // Utility Functions \\
//=====================\\


function findAndReplaceWith(matchRegex, searchArray, replaceRegex, replacementString, isReturnValueAnArrayOfArrays)
{
    var attributeArray = [];
    var businessString = '';
    var regexMatchArray = [];

    if(!replacementString)
    {
        replacementString = '';
    }

    for(var i = 0; i < searchArray.length; i++)
    {
        regexMatchArray = searchArray[i].match(matchRegex);


        if(regexMatchArray)//a match was found
        {
            if(!isReturnValueAnArrayOfArrays)//push string to array
            {
                if(replaceRegex)
                {
                    businessString = regexMatchArray[0].replace(replaceRegex, replacementString);
                }
                else
                {
                    businessString = regexMatchArray[0];
                }

                if(businessString.match(/&amp;/))
                {
                    businessString = businessString.replace(/&amp;/, '&')
                }

                attributeArray.push(businessString);
            }
            else//push array to array
            {
                for(var j = 0; j < regexMatchArray.length; j++)
                {
                    regexMatchArray[j] = regexMatchArray[j].replace(replaceRegex, replacementString);
                }
                attributeArray.push(regexMatchArray);
            }
        }
        else
        {
            attributeArray.push(null);
        }
    }
    return attributeArray;
}