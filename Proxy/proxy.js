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

var listeningPort = 8000;

var interpreterIP = '10.240.212.83';//internal ip
var interpreterPort = 9000;

//node proxy.js <port> <ip> <port>

if(process.argv[2])
{
    if(process.argv[2].length == 4)
    {
        listeningPort = Number(process.argv[2]);
    }
}

if(process.argv[3])
{
    if(process.argv[3].length > 4)
    {
        interpreterIP = process.argv[3];
    }
    else if(process.argv[3] == 4)
    {
        interpreterPort = Number(process.argv[3]);
    }
}

if(process.argv[4])
{
    interpreterPort = Number(process.argv[4]);
}





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

}).listen(listeningPort);

console.log('listening on port: ' + listeningPort);
console.log('sending http response to the interpreter at IP: ' + interpreterIP + ' on Port: ' + interpreterPort);


function processRequestAndExecute(body)
{
    var json = JSON.parse(body);

    var cityObjectString = commandLineEncodeObjectString(JSON.stringify(json.cityObject));
    var requestURLString = JSON.stringify(json.requestURL);
    var executableFileName = 'phantomRequest.js';
    var interpreterURLString = '"http://' + interpreterIP + ':' + interpreterPort + '/"';

    var standardOutputString = 'phantomjs ' +  executableFileName + ' ' + cityObjectString + ' ' + requestURLString + ' ' + interpreterURLString;

    console.log('Output String \n' + standardOutputString);

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