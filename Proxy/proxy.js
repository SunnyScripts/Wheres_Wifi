/**
 * Created by Ryan Berg on 12/21/14.
 * rberg2@hotmail.com
 *
 * -Synopsis-
 *  proxies live in 1 of 3 geographical locations listening on an internal ip
 *  the proxy creates a phantomjs child process
 *  and sends that process data on the standard output
 */

var http = require('http');
var execute = require('child_process').exec;


http.createServer(function (request, response)
{
    var body = "";

    request.on('data', function (chunk)
    {
        body += chunk;
    });

    request.on('end', function ()
    {
        processRequestAndExecute(body);

        response.writeHead(200);
        response.end();
    });

}).listen(8080);
//TODO: set up internal listening
console.log('listening 8080');



function processRequestAndExecute(body)
{
    //TODO: are all these variables needed?
    var json = JSON.parse(body);

    var cityObjectString = commandLineEncodeObjectString(JSON.stringify(json.cityObject));
    var urlString = commandLineEncodeObjectString(JSON.stringify(json.requestURL));
    var executableFileName = 'phantomRequest.js';

    console.log('cityJSON:\n'+cityObjectString);
    //console.log(urlString);

    var standardOutputString = 'phantomjs ' +  executableFileName + ' ' + cityObjectString + ' ' + urlString;

    //TODO: is this variable needed
    var childProcess = execute(standardOutputString, function(error, standardOutput, standardOutputError)
    {
        console.log('stdout: ' + standardOutput);
        console.log('stderr: ' + standardOutputError);

        if (error !== null)
        {
            console.log('exec error: ' + error);
        }
    });
}


 // Utility Functions \\
//=====================\\


function commandLineEncodeObjectString(string)
{
    //escape quotes for standard output
    string = string.replace(/"|'/g, "\\\"");

    //put json in quotes for standard output
    string = '"'+string+'"';

    return string;
}