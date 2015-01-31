Hello Traveler

The tour begins with,

Public Restful API
================

Host: 146.148.92.109:10000
Path: /search

Query String:

Required Arguments: latitude=inDegrees&longitude=inDegrees

Options Parameter: radius=inMiles [default 1 mile]

Example Query: http://146.148.92.109:10000/search?latitude=34.261555&longitude=-118.301857&radius=2

Optionally set your "Content-Encoding" header to "gzip" for compressed responses.

Example JSON Response:

{

    _id: String(),
    name: String(),
    phoneNumber: String(),//'(012) 456-7890'
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

The Database
===============

The mongodb database is housed on a Debian Linux VM.

Scraping
====================

[mainDirector.js](Scraper/mainDirector.js) gets a random city from the database at random intervals.
It then sends the request info to a proxy in 1 of 3 geographical locations.

[proxy.js](Proxy/proxy.js) is a node listener that creates a child process of phantomjs.
The proxy then passes the data to the phantom process through standard output.

[phantomRequest.js](Proxy/phantomRequest.js) sends a phantomjs request with a random user agent set in the http header.
It then executes the javascript on the responding html and sends the resulting html to the html interpreter.

[htmlInterpreter.js](Scraper/htmlInterpreter.js) breaks apart the html with regular expressions to build a javascript object.
It then inserts the resulting json business in the businesses collection in the database.


Client
=======================

*under construction*