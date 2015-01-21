/**
 * Created by Ryan Berg on 1/6/15.
 * rberg2@hotmail.com
 *
 * -Synopsis-
 *  receives parameters from proxy and sends a phantomjs request
 *  and executes the javascript
 *  sending the resulting html to htmlInterpreter.js at an internal ip
 */

//TODO: screen resolution?
//page.viewportSize = { width: 1920, height: 1080 };

var system = require('system');

var standardError = system.stderr;
var argumentsArray = system.args;



var page = require('webpage').create();


//order of arguments:
//0: file name
//1: city json
//2: request url
//3: interpreter url



if(argumentsArray.length != 4)
{
    standardError.write('wrong number of arguments passed');
    phantom.exit(1);
}

console.log(argumentsArray[3]);

var cityObjectString = argumentsArray[1].replace(/\\/g, '');
var cityObject = JSON.parse(cityObjectString);

var urlRequest = argumentsArray[2];

page.settings.userAgent = JSON.stringify(cityObject.userAgent);

page.open(urlRequest,/*settings*/ function(status)
{
    console.log('url request: ' + urlRequest);
    console.log('user agent: ' + page.settings.userAgent);
    console.log('url request status: ' + status);

    page.onResourceReceived = function(response)
    {
        //console.log('status code: ' + response.status);
    };

    if(status == 'fail')
    {
        standardError.writeLine('url request failed');
        phantom.exit();
    }

    var evaluation = page.evaluate(function()
    {

    });

    var requestBody =
    {
        'cityObject': cityObject,
        'htmlData': page.content
    };

    requestBody = JSON.stringify(requestBody);

    page.open(argumentsArray[3], 'POST', requestBody, function(status)
    {
        if(status == 'fail')
        {
            standardError.writeLine('POST to htmlInterpreter.js FAILED');
        }
        else
        {
            console.log('interpreter send status: ' + status);
        }
        phantom.exit();
    });
});