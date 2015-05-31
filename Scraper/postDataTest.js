/**
 * Created by Ryan Berg on 12/30/14.
 * rberg2@hotmail.com
 */
var request = require('request');

var fileSystem = require('fs');

fileSystem.readFile("./Test HTML/San Francisco,CA.html", "utf8", function(error, file)
{
    if(error)
    {
        throw error;
    }
    request.post({
        headers: {'content-type' : 'application/json'},
        url:     'http://localhost:9000',
        body:    JSON.stringify({htmlData: file, cityObject:{city:'San Jose', state:'CA'}})
    }, function(error, response, body)
    {
        if(error)
        {
            throw error;
        }
        console.log(response.statusCode);
    });

});
//var mongojs = require('mongojs');
//
//var db = mongojs('130.211.163.79/Wheres_Wifi', ['cities']);
//
//var object =
//{
//    '_id': 'testObject2',
//    'createdOn': Date()
//};
//
//db.cities.update({'searchIP': null}, {$set:{'isLogCompleted': false,'lastPageRequest':null,'searchProxy':null}}, {multi:true})
//{
//    if(error)
//    {
//        throw error;
//    }
//
//    console.log(value);
//});