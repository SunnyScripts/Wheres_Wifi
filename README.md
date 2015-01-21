Hello Travelers
The tour begins with,

The Database
===============

The mongodb database is housed on a Debian Linux VM.
[details](Database/README.md)

Scraping
====================

[mainDirector.js](Scraper/mainDirector.js) gets a random city from the database at random intervals.
It then sends the request info to a proxy in 1 of 3 geographical locations.

[proxy.js](Proxy/proxy.js) is a node listener that creates a child process of phantomjs.
The proxy then passes the data to the phantom process through standard output.

[phantomRequest.js](Proxy/phantomRequest.js) sends a phantomjs request with a random user agent set in the http header.
It then executes the javascript on the responding html and sends the resulting html to the html interpreter internally.

[htmlInterpreter.js](Scraper/htmlInterpreter.js) breaks apart the html with regular expressions to build a javascript object.
It then inserts the resulting json business in the businesses collection in the database.


Server / Client
=======================

*under construction*