/**
 * Created by ryan berg on 12/15/14.
 * rberg2@hotmail.com
 */

var numberOfPages = 25;


for(var i = 0; i < numberOfPages; i++)
{
    var pageNumber = i + 1;
    var pageNumberString = '';

    if(i > 0)
    {
        pageNumberString = 'p' + String(pageNumber);
    }

    var requestString = 'http://www.topix.com/city/list/' + pageNumberString;

    requestFunction(requestString, pageNumber);
}

function requestFunction(requestString, pageNumber)
{
    var request = require('request');

    request(requestString, function (error, response, htmlData)
    {
        if (!error && response.statusCode == 200)
        {

            var cityObjectArray = [];

            var columnArray = htmlData.match(/_col"[^_]*/g);

            //TODO: add comments for clarity
            for (var i = 0; i < columnArray.length; i++)
            {
                var cityInfoArray = columnArray[i].match(/[A-Z][^,]*, [A-Z]{2}/g);


                if (cityInfoArray)
                {
                    for (var j = 0; j < cityInfoArray.length; j++)
                    {
                        //TODO: change array name
                        var array = cityInfoArray[j].match(/\(/);

                        if (!array)
                        {
                            var stateArray = cityInfoArray[j].match(/[A-Z]{2}/);
                            var cityString = cityInfoArray[j].replace(/, [A-Z]{2}/, '');

                            var cityObject = {city: cityString, state: stateArray[0]};
                            cityObjectArray.push(cityObject);
                        }
                    }
                }


            }

//            console.log(cityObjectArray);
            writeDataToFile(JSON.stringify(cityObjectArray), 'us-cities-pg'+String(pageNumber)+'.json');

        }
    });
}

function writeDataToFile(data, fileName)
{
    fs = require('fs');

    fs.writeFile(fileName, data, function(error)
    {
        if(error)
        {
            throw error;
        }
    });
}