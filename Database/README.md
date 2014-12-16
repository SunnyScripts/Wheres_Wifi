Where's Wifi API
=============


The database uses mongodb and follows these guidelines:


Database name:'Wheres_Wifi'

Collections: 'businesses'

URI Format:
*under construction*

JSON Format:

{

    _id: String(),
    name: String(),
    category: String(),
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