/**
 * Created by Ryan Berg on 12/9/14.
 * rberg2@hotmail.com
 */


var http = require("http");

var fs = require('fs');

var mongojs = require('mongojs');
var zlib = require('zlib');
var requestLib = require('request');


var db = mongojs('10.240.212.83:7000/Wheres_Wifi', ['businesses']);//146.148.81.137

const oneMileInDegrees = .016666666666667;

//bounds category sort?

//API
//http://turingweb.com:10000/search?latitude=aNumber&longitude=aNumber&raduis=aNumberInMiles
//TODO: authentication, create a password field
//TODO: rate limiting?
//TODO: SSL

http.createServer(function(request, response)
{
    var url = require('url');

    queryJson = url.parse(request.url,true).query;
    var pathname = url.parse(request.url,true).pathname;

    console.log('request received: ' + JSON.stringify(queryJson));
    //logRequest(request.connection.remoteAddress);


    if(pathname =='/search' && queryJson.latitude && queryJson.longitude)
    {
        if(!queryJson.radius || queryJson.radius <= 0)
        {
            queryJson.raduis = 1;//mile
        }
        else if(queryJson.radius > 10)
        {
            queryJson.raduis = 10;
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
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
    else if(pathname == '/wifi_check' && queryJson.business_id)
    {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var urlString = 'http://www.yelp.com/biz/'+queryJson.business_id;

        requestLib(urlString, function (error, responseHeader, body)
        {
            if (!error && responseHeader.statusCode == 200)
            {
                var regexResult = body.match(/<dt class="attribute-key">[^W]*Wi-Fi[\s\S]*?<\/dd>/g);

                if(regexResult)
                {
                    regexResult = regexResult[0];
                    if(regexResult.match(/Free/g))
                    {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.end("free\n");
                    }
                    else if(regexResult.match(/Paid/g))
                    {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.end("paid\n");
                    }
                    else
                    {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.end("none\n");
                    }
                }
                else//wifi: no
                {
                    response.writeHead(200, {"Content-Type": "text/plain"});
                    response.end("none\n");
                }
            }
            else//no wifi data
            {
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.end(error);
            }
        });


    }
    else
    {
        var jsonErrorMessage =
        {
            "message" : "Error in URL",
            "description" : "The API requires a latitude and longitude at the search path.",
            "exampleURL": "http://localhost:10000/search?latitude=aNumber&longitude=aNumber"
        };

        response.writeHead(404, {"Content-Type": "application/json"});
        response.write(JSON.stringify(jsonErrorMessage));
        response.end();
    }
}).listen(10000);
console.log('server started. listening on port 10000');



function logRequest(ip)
{
    fs.appendFile('apiRequest.log', ',{_id:'+new Date()+',ip:'+ip+'}', function (error) {
        if (error) console.log(error);
    });
}