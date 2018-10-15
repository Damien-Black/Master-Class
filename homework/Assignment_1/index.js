/*
    This module creates a simple HTTP service that:
        1. Allows a user to post (interpreting this as any type or request) to /hello
        2. Responds with a message in the form: {'message': 'some message'}

    The service will say hi back.
*/

const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const portForListening = 3000

// Setup server
server = http.createServer(function (req, resp) {
    procReq(req, resp);
})

server.listen(portForListening, function(){
    console.log('Server listening on ', portForListening)
});

procReq = function processRequest(req, resp) {
    // process URL
    parsedUrl = url.parse(req.url, true);
    path = parsedUrl.pathname;
    trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Resolve request metadata
    const queryStringObj = parsedUrl.query;
    const headers = req.headers;
    const method = req.method;

    // Resolve payload
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data);
    })

    // Request end event handler
    req.on('end', function(){
        // Resolve any remaining payload in buffer
        buffer += decoder.end();

        // Choose handler, default to not found
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        data = {
            'trimmedPath': trimmedPath,
            'queryStringObj': queryStringObj,
            'method': method,
            'payload': buffer,
            'headers': headers
        };

        // Route request
        chosenHandler(data, function(statusCode, payload){
            // Use handlers status code, or use default 200
            // Use handler payload or use {}
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to string
            const payloadString = JSON.stringify(payload);

            // Set content type to JSON
            resp.setHeader('Content-Type', 'application/json');
            resp.writeHead(statusCode);
            resp.end(payloadString);

            // Log what server did
            console.log('Returning payload: ', payloadString);
            console.log('Returning status code: ', statusCode, '\n');
        });
    })
}


// Define handlers
const handlers = {}
handlers.greet = function sayHiBackWiseauStyle(data, callback) {
    console.log('Someone is saying hi to us.');
    callback(200, {'message': 'Oh hai Mark!'});
};

handlers.notFound = function noValidEndPointFound(data, callback) {
    callback(404);
};


// Define router
router = {
    'hello': handlers.greet
};
