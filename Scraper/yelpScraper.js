/**
 * Created by Ryan Berg on 12/9/14.
 * rberg2@hotmail.com
 */



//start of loop

//TODO: check interrupt file for starting point
//var i = 0;//startingPoint

var numberOfDataFiles = 1;

for(var i = 0; i < numberOfDataFiles; i++)
{
    var pageNumber = i + 1;

    var fileName = 'us_city_list/us-cities-pg'+pageNumber+'.json';

    fs = require('fs');

    fs.readFile(fileName, 'utf8', function(error, data)
    {
        if (error)
        {
            throw error;
        }

        var jsonData = JSON.parse(data);

        for(var j = 0; j < 10; j++)
        {
            yelpScrapeWithURIAttributes(jsonData[j].city, jsonData[j].state);
        }
    });

}




function yelpScrapeWithURIAttributes(city, state)
{
    //TODO: proxy ip for request

    var numberOfPagesString = '';
    var pageNumber = 1;

//    for(var i = 0; )

    var request = require('request');

    var requestString = 'http://www.yelp.com/search?attrs=WiFi.free&l=p:'+state+':'+city+'::';

    //switch case?: 0, 1, 1+

    request(requestString, function (error, response, htmlData)
    {
        var array = htmlData.match(/Page 1 of \d*/g);//find available pages in htmlData //regex = Page \d of \d*


        if(array)//does page have any results
        {
            var pageCountString = array[0].replace('Page 1 of ', /*with*/'');

            var pageCount = Number(pageCountString);

            if(pageCount != 1)
            {
                for(var i = 0; i < pageCount; i++)
                {

                }
            }

            if (!error && response.statusCode == 200)
            {

                //should be asynchronous
                saveBusinessObjectsToDataBase
                (
                    putBusinessAttributesIntoJSONFormatFrom(htmlData)
                    //returns array of json objects;
                );
            }
            else if(error)
            {
                throw error;
            }
            else
            {
                console.log(response.statusCode);
            }
        }
    });


}

function putBusinessAttributesIntoJSONFormatFrom(htmlData)
{
    //bloated array will contain all matches with some extra around the edges
    //find and replace trims each entry in the bloated array
    //and finally, a for loop organizes the arrays into json

    //biz id and biz name//

    //TODO: check for CLOSED in business name

    var bloatedArray = htmlData.match(/" href="\/biz\/[a-zA-Z0-9-]*[^>]*>[^<]*</g);

    var idArray = findAndReplaceWith(/biz\/[^"]*/, 'biz/', bloatedArray);
    var nameArray = findAndReplaceWith(/>[^<]*/, '>', bloatedArray);


    //biz category//
    bloatedArray = htmlData.match(/"category-str-list"[^"]*"[^"]*">[^<]*<\//g);
    var categoryArray = findAndReplaceWith(/[a-zA-Z &]*<\//g, '</', bloatedArray);


    //biz address//
    bloatedArray = htmlData.match(/([A-Z]|[0-9])[^<]*<br>[^\d]*\d*/g);
    var addressArray = bloatedArray;


    //biz lat and long//
    bloatedArray = htmlData.match(/location":\D*\d*.\d*\D*\d*.\d*/g);
    var latitudeArray = findAndReplaceWith(/latitude": -*\d*.\d*/, 'latitude": ', bloatedArray);
    var longitudeArray = findAndReplaceWith(/longitude": -*\d*.\d*/, 'longitude": ', bloatedArray);



    //Create business objects//

    var numberOfBusinesses = bloatedArray.length;
    htmlData = null;
    bloatedArray = null;
    var businessObjectArray = [];

    for(var i = 0; i < numberOfBusinesses; i++)
    {
        //TODO: break apart address

        var businessObject =
        {
            _id: idArray[i],
            name: nameArray[i],
            category: categoryArray[i],
            address:
            {
                fullAddress: '',
                street: '',
                city: '',
                state: '',
                zip: ''
            },
            latitude: Number(latitudeArray[i]),
            longitude: Number(longitudeArray[i])
        };

        businessObjectArray.push(businessObject);
    }

    return businessObjectArray;
}



function saveBusinessObjectsToDataBase(businessArray)
{
    console.log(businessArray);

    var mongojs = require('mongojs');

    var db = mongojs('130.211.163.79/dragon', ['businesses']);

    db.businesses.insert(businessArray);

    //return success or failure
    return true;
}

function findAndReplaceWith(matchRegex, replaceRegex, searchArray)
{
    var attributeArray = [];

    for(var i = 0; i < searchArray.length; i++)
    {
        if(matchRegex)
        {
            var regexMatchArray = searchArray[i].match(matchRegex);

            if(!regexMatchArray)
            {
                console.log('regex match error');
                return -1;
            }
        }

        var businessString = regexMatchArray[0].replace(replaceRegex, /*with*/'');

        attributeArray.push(businessString);
    }

    return attributeArray;
}

function makeRequestWithURL(requestString)
{
    //TODO: move request logic into a separate function

    // get html data

    //regex for page count  //if array is null, page count is 0

    //switch case
    //0
    //1
    //1+

}