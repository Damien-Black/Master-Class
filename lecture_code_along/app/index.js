/* 
Primary file for my first API
*/

const config = require('./config');

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder

console.log('Current environment ', config.envName)

// HTTP server
httpServer = http.createServer(function(req, resp) {
    unifiedServer(req, resp)
});

httpServer.listen(config.httpPort, function(){
    console.log('Server is listening on port ', config.httpPort)
});

// HTTPS server
httpsServerOptions = {
    'key': fs.readFileSync('./HTTPS/key.pem'),
    'cert': fs.readFileSync('./HTTPS/cert.pem')
};

httpsServer = https.createServer(httpsServerOptions, function(req, resp) {
    unifiedServer(req, resp)
});

httpsServer.listen(config.httpsPort, function(){
    console.log('Server is listening on port ', config.httpsPort)
});


// Server logic
function unifiedServer(req, resp) {

    // Get URL and parse it
    parsedUrl = url.parse(req.url, true);

    // Get path from URL
    path = parsedUrl.pathname;
    console.log('URL path is: ' + path);
    trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Query string
    var queryStringObj = parsedUrl.query;

    // Get HTTP method
    var method = req.method.toLowerCase();

    // Get headers
    var headers = req.headers;

    // Get payload
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data);
    })

    req.on('end', function(){
        buffer += decoder.end();

        // Choose handler, default to not found
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Setup data for handlers
        data = {
            'trimmedPath': trimmedPath,
            'queryStringObj': queryStringObj,
            'method': method,
            'payload': buffer,
            'headers': headers
        }

        // Route request
        console.log(chosenHandler)
        chosenHandler(data, function(statusCode, payload){
            // Use handlers status code, or use default 200
            // Use handler payload or use {}
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to string
            var payloadString = JSON.stringify(payload);

            resp.setHeader('Content-Type', 'application/json');
            resp.writeHead(statusCode);
            resp.end(payloadString);

            // Log to our sys
            console.log('Returning payload: ', payloadString);
            console.log('Returning status code: ', statusCode, '\n');
        });
    })
}

// Define handlers Handles
/*
Note the handler.item = function(){} style

This makes the functions ambiguous, it seems it would be better to do

function item_handler() {}
router = {
    'item': item_handler
}

AirBnB JS style guide dictates:

const short_name = function item_handler_long_descriptive_name() {}
router = {
    'item': short_name
}

Try and get peoples feedback on this
*/
var handlers = {};

handlers.ping = function(data, callback) {
    callback(200)
};

handlers.notFound = function (data, callback) {
    callback(404)
};

// Define a request handler
var router = {
    'ping': handlers.ping
};
