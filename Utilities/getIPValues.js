/**
 * Created by Ryan Berg on 1/6/15.
 * rberg2@hotmail.com
 */

//< 30k
//< 40k
//< 50k
//< 60k
//< 100k
//< 200k
//< 500k


var mongojs = require('mongojs');
var request = require('request');

var db = mongojs('130.211.163.79/Wheres_Wifi', ['userAgents']);

const databaseCount = 200;
//const sumOfAllIPs = 12356085;

var thirtykArray = [];
var foutrykArray = [];
var fiftykArray = [];
var sixtykArray = [];
var oneHundredkArray = [];
var twoHundredkArray = [];
var fiveHundredkArray = [];

var doneCount = 0;

for(var i = 0; i < databaseCount; i++)
{
    db.userAgents.find({'rank': i + 1}, function(error, resultArray)
    {
        if (error) throw error;

        if (resultArray[0].numberOfIPs < 30000)
        {
            thirtykArray.push(resultArray[0]);
        }
        else if (resultArray[0].numberOfIPs >= 30000 && resultArray[0].numberOfIPs < 40000)
        {
            foutrykArray.push(resultArray[0]);
        }
        else if (resultArray[0].numberOfIPs >= 40000 && resultArray[0].numberOfIPs < 50000)
        {
            fiftykArray.push(resultArray[0]);
        }
        else if (resultArray[0].numberOfIPs >= 50000 && resultArray[0].numberOfIPs < 60000)
        {
            sixtykArray.push(resultArray[0]);
        }
        else if (resultArray[0].numberOfIPs >= 60000 && resultArray[0].numberOfIPs < 100000)
        {
            oneHundredkArray.push(resultArray[0]);
        }
        else if (resultArray[0].numberOfIPs >= 100000 && resultArray[0].numberOfIPs < 200000)
        {
            twoHundredkArray.push(resultArray[0]);
        }
        else if (resultArray[0].numberOfIPs >= 200000)
        {
            fiveHundredkArray.push(resultArray[0]);
        }
        else
        {
            throw Error(resultArray[0].numberOfIPs);
        }

        doneCount++;

        if(doneCount == databaseCount)
        {
            processArray(thirtykArray, 0);//5
            processArray(foutrykArray, 1);//5
            processArray(fiftykArray, 2);//10
            processArray(sixtykArray, 3);//10
            processArray(oneHundredkArray, 4);//15
            processArray(twoHundredkArray, 5);//25
            processArray(fiveHundredkArray, 6);//30
        }

    });
}

function processArray(array, rank)
{
    for(var i = 0; i < array.length; i++)
    {
        db.userAgents.update({'_id': array[i]._id}, {$set : {'randomRank': rank, 'randomNumber': i}}, function(error)
        {
            if(error) throw error;
        });
    }

    //console.log(name + '/n' + array.length + '/n');

    //var sumOfIPs = 0;
    //
    //for(var i = 0; i < array.length; i++)
    //{
    //    sumOfIPs += Number(array[i].numberOfIPs);
    //}
    //
    //console.log(sumOfIPs, array.length);
    //console.log(sumOfIPs / sumOfAllIPs)
}