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
var interpreterURL = 'http://localhost:8888/';

//order of arguments:
//0: file name
//1: city json
//2: request url


var cityObject = null;

//TODO: accept arguments in either order

if(argumentsArray.length != 3)
{
    standardError.write('wrong number of arguments passed');
    phantom.exit(1);
}

var cityObjectString = argumentsArray[1].replace(/\\/g, '');
cityObject = JSON.parse(cityObjectString);

var urlRequest = argumentsArray[2];


page.settings.userAgent = cityObject.userAgent;




//TODO: settings?, status?
page.open(urlRequest,/*settings*/ function()
{
    var evaluation = page.evaluate(function()
    {

    });

    var requestBody =
    {
        'cityObject': cityObject,
        'htmlData': page.content
    };

    requestBody = JSON.stringify(requestBody);

    page.open(interpreterURL, 'POST', requestBody, function(status)
    {
        if(status == 'failure')
        {
            standardError.write('POST to htmlInterpreter.js FAILED');
        }
        else
        {
            console.log(status);
        }
        phantom.exit();
    });
});