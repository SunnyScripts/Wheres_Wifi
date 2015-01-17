/**
 * Created by Ryan Berg on 1/5/15.
 * rberg2@hotmail.com
 */

//each user agent has a 'randomRank' based on its popularity
//there are 7 'randomRanks', 0 the lowest, 6 the highest and most popular

//the probability for a 'randomRank' to be chosen are
//5% for 'randomRank' 0, 30% for 'randomRank' 6, etc.
var percentProbabilityArray = [.05,.05,.1,.1,.15,.25,.3];
var probabilityArray = [];

//multiplying the percent probability by the lowest common multiple (20)
//gives you the number of times that 'randomRank' will be in the graph node array
//example: .05 * 20 = 1; so {'randomRank': 0} will go into the graphNode array 1 time
for(var i = 0; i < percentProbabilityArray.length; i++)
{
    for(var j = 0; j < percentProbabilityArray[i] * 20; j++)
    {
        probabilityArray.push(i);
    }
}
//the resulting array looks like this:
//graphNodeArray = [0, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6]

console.log(probabilityArray);

//when a random index is chosen for the graph node array,
//the probability for any rank matches the probability array


function createWholeRandomNumberWith(minimumValue, maximumValue)
{
    return Math.floor(Math.random()*(maximumValue - minimumValue + 1) + minimumValue);
}