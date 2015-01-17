/**
 * Created by Ryan Berg on 12/15/14.
 * rberg2@hotmail.com
 */



const maxNumberOfPages = 25;
var numberOfResponses = 0;

var cityObjectArray = [];

for(var i = 0; i < maxNumberOfPages; i++)
{
    var pageNumber = i + 1;
    var pageNumberString = '';

    if(i > 0)
    {
        pageNumberString = 'p' + String(pageNumber);
    }

    var requestString = 'http://www.topix.com/city/list/' + pageNumberString;

    sendRequestWithURLString(requestString);
}

function sendRequestWithURLString(requestString)
{
    var request = require('request');

    request(requestString, function (error, response, htmlData)
    {
        if (!error && response.statusCode == 200)
        {
            numberOfResponses++;

            //html page contains 4 columns of cities
            var columnArray = htmlData.match(/_col"[^_]*/g);

            for (var i = 0; i < columnArray.length; i++)
            {
                //find every city in the column
                var cityInfoArray = columnArray[i].match(/[A-Z][^,]*, [A-Z]{2}/g);

                //are there any cities in the array, potential for 5th empty column
                if (cityInfoArray)
                {
                    for (var j = 0; j < cityInfoArray.length; j++)
                    {
                        //'Addison (Webster Springs), WV' is NOT wanted
                        //considered a duplicate entry
                        var citySubdomainArray = cityInfoArray[j].match(/\(/);

                        //if not a duplicate entry
                        if (!citySubdomainArray)
                        {
                            //separate the city from the state data
                            var stateArray = cityInfoArray[j].match(/[A-Z]{2}/);
                            var cityString = cityInfoArray[j].replace(/, [A-Z]{2}/, '');

                            var cityObject = {'city': cityString, 'state': stateArray[0]};

                            cityObjectArray.push(cityObject);
                        }
                    }
                }
            }
            if(numberOfResponses == maxNumberOfPages)
            {
                writeDataToFile(JSON.stringify(cityObjectArray), 'cityList.json');
            }
        }
    });
}

function writeDataToFile(data, fileName)
{
    fs = require('fs');

    fs.writeFile(fileName, data, function(error)
    {
        if(error) { throw error; }
    });
}