/**
 * Created by Ryan Berg on 1/5/15.
 * rberg2@hotmail.com
 */


var fileSystem = require('fs');
var mongojs = require('mongojs');

var db = mongojs('###.###.###.###/Wheres_Wifi', ['userAgents']);

const numberOfPagesForScrape = 4;//getting the first 200 user agents, 50 per page


for(var i = 0; i < numberOfPagesForScrape; i++)
{
    fileSystem.readFile('./userAgentHTML/user_agents_pg' + (i + 1) + '.html', 'utf8', function(error, data)
    {
        if(error) throw error;

        saveObjectsToDatabase
        (
            performRegularExpressionOn(data)//returns array of json
        );

    });
}

function performRegularExpressionOn(htmlData)
{
    //match each odd group on page
    var bloatedUserAgentArray = htmlData.match(/<tr class="odd">[\s\S]*?<\/tr>/g);

    //match each even group on the page
    //and add it to the array
    bloatedUserAgentArray.push.apply(bloatedUserAgentArray, htmlData.match(/<tr class="even">[\s\S]*?<\/tr>/g));

    var userAgentJSONArray = [];

    var id = '';
    var bloatedIDString = '';

    var rank = 0;

    var numberOfIPs = 0;
    var bloatedNumberOfIPsString = '';
    
    var userAgentObject = {};

    for(var i = 0; i < bloatedUserAgentArray.length; i++)
    {
        bloatedIDString = bloatedUserAgentArray[i].match(/(Mozilla\/|Opera\/)[\s\S]*?<\/a>/)[0];
        id = bloatedIDString.replace(/<\/a>/, '');

        rank = Number(bloatedUserAgentArray[i].match(/\d+/)[0]);

        bloatedNumberOfIPsString = bloatedUserAgentArray[i].match(/[\d,]+?<\/a> ip/)[0];
        bloatedNumberOfIPsString = bloatedNumberOfIPsString.replace(/<\/a> ip/, '');
        numberOfIPs = bloatedNumberOfIPsString.replace(/,/, '');
        
        userAgentObject = 
        {
            '_id': id,
            'rank': rank,
            'numberOfIPs': numberOfIPs
        };
        
        userAgentJSONArray.push(userAgentObject);
    }

    return userAgentJSONArray;
}

function saveObjectsToDatabase(objects)
{
    db.userAgents.insert(objects, function(error)
    {
        if(error) throw error;
    });
}