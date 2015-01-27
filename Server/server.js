/**
 * Created by Ryan Berg on 12/9/14.
 * rberg2@hotmail.com
 */

var http = require("http");
var url = require('url');

var mongojs = require('mongojs');

var db = mongojs('130.211.163.79/Wheres_Wifi', ['cities']);

var fileData;

//bounds address category sort?

var fs = require('fs');

fs.readFile('cityList.json', 'utf8', function(error, data)
{
    fileData = data;
});

//TODO: create a static html file to serve
//TODO: default /search result?
//TODO: router: / /search (others?, switch case?)
//TODO: create a password field

http.createServer(function(request, response)
{
    console.log('request received');

    console.log(request.url);

    queryJson = url.parse(request.url,true).query;
    var pathname = url.parse(request.url,true).pathname;

    if(pathname != '/search')
    {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write('I\'m looking for a url with pathname \n\n/search\n\nand parameters: \n\nbounds={topLeft(point), topRight(point), bottomLeft(point), bottomRight(point)} \nor address=String()\n\nwith optional parameters:\n\ncategory or sortMethod');
        response.end();

    }
    else if(queryJson.bounds && !queryJson.address)
    {
        console.log('bounds');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end('dragon node');
    }
    else if(!queryJson.bounds && queryJson.address)
    {
        var json = [{'type': 'apple'}, {'type': 'orange'}];
        console.log('address');

        db.cities.findOne({}, function(error, value)
        {
            if(error)
            {
                console.log(error);
            }
            response.writeHead(200, {"Content-Type": "application/json"});
            console.log(value);
            response.write(JSON.stringify(value));
            response.end();
        });


    }



}).listen(8888);

console.log('server started. listening on port 8888');
