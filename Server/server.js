/**
 * Created by Ryan Berg on 12/9/14.
 * rberg2@hotmail.com
 */

var http = require("http");

http.createServer(function(request, response)
{
    console.log('request received');

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write('dragon node');

    response.end();
}).listen(8888);

console.log('server started. listening on port 8888');
