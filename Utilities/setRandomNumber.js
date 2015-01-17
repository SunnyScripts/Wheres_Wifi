/**
 * Created by ryanberg on 12/24/14.
 */

var fileSystem = require('fs');
var numberOfDataFiles = 25;
//var randomNumber = 0;

var mongojs = require('mongojs');
var db = mongojs('###.###.###.###/Wheres_Wifi', ['cities']);

//18228

var randomNumberArray = new Array(37583);

for(var i = 0; i < randomNumberArray.length; i++)
{
    randomNumberArray[i] = i;
}

randomNumberArray = shuffle(randomNumberArray);

console.log(randomNumberArray);

function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}
var array = [];
var index = 0;

for(i = 0; i < numberOfDataFiles; i++)
{


    var pageNumber = i + 1;

    var fileName = './us_city_list/us-cities-pg'+pageNumber+'.json';


    fileSystem.readFile(fileName, 'utf8', function(error, data)
    {
        if (error)
        {
            throw error;
        }

        var cityArrayFromFile = JSON.parse(data);

        for(var j = 0; j < cityArrayFromFile.length; j++)
        {
            var object = {'_id': cityArrayFromFile[j].city+','+cityArrayFromFile[j].state};
            array.push(object);
            console.log(randomNumberArray[index]);
            //db.cities.update({'_id': cityArrayFromFile[j].city+','+cityArrayFromFile[j].state}, {$set: {'randomNumber': randomNumberArray[index]}}, function(error, value)
            //{
            //    if(error)
            //    {
            //        throw error;
            //    }
            //
            //    console.log('updated');
            //    console.log(value);
            //});
            index ++;
        }
        console.log('array length ' + array.length);
    });
}


