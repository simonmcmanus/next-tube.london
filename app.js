'use strict';

var express = require('express');
var app = express();
var async = require('async');
var socket = require('socket.io');
var http = require('http');

var POLL_INTERVAL = 5000;


var nextTrain = require('./fetchers/next-train.js');
// requests always served from the cache and then updated over websockets.
var cache = {};
// keep track of the connected sockets.
var sockets = {};

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: require('./fetchers/tfl-status.js'),
        nextTrain: nextTrain.getAll,
        nextBus: require('./fetchers/next-bus.js')
    };
    async.parallel(methods, function(error, data) {
        callback(null, data);
    });
}

// on startup get the latest data.
fetchAllWidgetData(function(errorSet, dataSet) {
    cache = dataSet;
});
 
 /**
 * Notify connected clients that there is a new value.
 */
function notifyAllClients(widget, data) {
    for (var socket in sockets) {
        sockets[socket].emit(widget, data);
    }
}


// ceck all feeds 
setInterval(function() {
    fetchAllWidgetData(function(es, ds) {
        for (var widget in cache) {
            if(widget === 'nextTrain') {
                nextTrain.checkForChanges(ds, cache, sockets);
            } else {
                if (JSON.stringify(cache[widget]) !== JSON.stringify(ds[widget])) {
                    notifyAllClients(widget, ds[widget]);
                }                
            }
        }
        cache = ds;
    });
}, POLL_INTERVAL);

app.use(express.static('public')); 

app.get('/', function(req, res) {
    if(req.query.data === 'true') {
        return res.json(cache);
    }
    res.render('layout.jade', cache);
});

app.get('/next-train/:line/:station', function(req, res) {
    if(cache.nextTrain[req.params.station]) {
        return res.json(cache.nextTrain[req.params.station]);
    } else {
        nextTrain.get(req.params.station, function(error, data) {
            res.json(data);
        });        
    }
});

var server = http.createServer(app); 
var port =  process.env.PORT || 4000;

server.listen(port, function() {
    console.log('Listening on ' + port);
});

var io = socket.listen(server);

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;
    var events = nextTrain.events;
    for(var ev in events) {
        socket.on(ev, events[ev].bind(null, socket.id));
    }
    socket.on('disconnect', function() {
        delete sockets[socket.id];
    });
});
