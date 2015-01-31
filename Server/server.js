/**
 * Created by Ryan Berg on 12/9/14.
 * rberg2@hotmail.com
 */

var http = require("http");
var url = require('url');

var mongojs = require('mongojs');
var zlib = require('zlib');

var db = mongojs('10.240.212.83:7000/Wheres_Wifi', ['businesses']);//146.148.81.137

const oneMileInDegrees = .016666666666667;

//bounds category sort?

//API
//http://serverIP:6000/search?latitude=aNumber&longitude=aNumber&raduis=aNumberInMiles

//TODO: create a static html file to serve
//TODO: authentication, create a password field
//TODO: rate limiting?
//TODO: SSL

http.createServer(function(request, response)
{

    queryJson = url.parse(request.url,true).query;
    var pathname = url.parse(request.url,true).pathname;

    console.log('request received: ' + JSON.stringify(queryJson));


    if(pathname =='/search' && queryJson.latitude && queryJson.longitude)
    {
        if(!queryJson.radius || queryJson.radius <= 0)
        {
            queryJson.raduis = 1;//mile
        }

        db.businesses.find(
            {
                latitude:
            {
                $lt:Number(queryJson.latitude) + (queryJson.radius * oneMileInDegrees),/*North boundary*/
                $gt:Number(queryJson.latitude) - (queryJson.radius * oneMileInDegrees)/*South boundary*/
            },
                longitude:
                {
                    $gt:Number(queryJson.longitude) - (queryJson.radius * oneMileInDegrees),/*West boundary*/
                    $lt:Number(queryJson.longitude) + (queryJson.radius * oneMileInDegrees)/*East boundary*/
                }
            },
            function(error, businessObjects)
        {
            if(error) { throw error; }

            //gzip supported
            if(businessObjects && request.headers['accept-encoding'].match(/\bgzip\b/i))
            {
                zlib.gzip(JSON.stringify(businessObjects), function(error, buffer)
                {
                    if(error) { throw error; }

                    response.writeHead(200, {"Content-Type": "application/json", "Content-Encoding": "gzip"});
                    response.write(buffer);
                    response.end();

                });
            }
            //gzip not supported
            else
            {
                response.writeHead(200, {"Content-Type": "application/json"});
                response.write(JSON.stringify(businessObjects));
                response.end();
            }
        });
    }
    else
    {
        var jsonErrorMessage =
        {
            "message" : "Error in URL",
            "description" : "The API requires a latitude and longitude at the search path.",
            "exampleURL": "http://localhost:6000/search?latitude=aNumber&longitude=aNumber"
        };

        response.writeHead(404, {"Content-Type": "application/json"});
        response.write(JSON.stringify(jsonErrorMessage));
        response.end();
    }
}).listen(10000);
console.log('server started. listening on port 10000');