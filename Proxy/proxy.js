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

var interpreterIP = '10.240.162.148';//internal ip 10.240.162.148
var interpreterPort = 9000;

//shell arguments
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
        response.writeHead(200);
        response.end();

        processRequestAndExecute(body);
    });

}).listen(listeningPort);

console.log('listening on port: ' + listeningPort);
console.log('sending http response to the interpreter at IP: ' + interpreterIP + ' on Port: ' + interpreterPort);


function processRequestAndExecute(body)
{
    var json = JSON.parse(body);

    var standardOutputString = 'phantomjs phantomRequest.js ' + commandLineEncodeObjectString(JSON.stringify(json.cityObject)) + ' ' + JSON.stringify(json.requestURL) + ' ' + '"http://' + interpreterIP + ':' + interpreterPort + '/"';
    json = null;


    var phantomjs = execute(standardOutputString, {timeout:6999}, function(error, standardOutput, standardOutputError)
    {
        //phantomjs.kill('SIGTERM');

        console.log('stdout: ' + standardOutput);
        if(standardOutputError)
        {
            console.log('\nstandard error: ' + standardOutputError);
        }

        if (error !== null)
        {
            //phantomjs.kill('SIGKILL');
            console.log('\nchild execution error: ' + error);
        }
    });
}


 // Utility Functions \\
//=====================\\


function commandLineEncodeObjectString(string)
{
    //escape quotes for standard output
    string = string.replace(/"/g, "\\\"");

    //put json in quotes for standard output
    string = '"'+string+'"';

    return string;
}
