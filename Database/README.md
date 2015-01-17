Where's Wifi API
=============

Database name:'Wheres_Wifi'

Collections: 'businesses', 'cities', 'userAgents'

URI Format:
*under construction*

JSON Format:

'businesses':
{

    _id: String(),
    name: String(),
    phoneNumber: String(),
    category: Array(),
    address:
    {
        fullAddress: String(),
        street: String(),
        city: String(),
        state: String(),
        zip: String()
    },
    latitude: Number(),
    longitude: Number(),
    ratingCount: Number(),
    ratingAverage: Number()
}