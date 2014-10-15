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


/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: require('./fetchers/tfl-status.js'),
        nextTrain: nextTrain.getAll.bind(null, io),
        nextBus: require('./fetchers/next-bus.js')
    };
    async.parallel(methods, function (error, data) {
        callback(null, data);
    });
}

// on startup get the latest data.
fetchAllWidgetData(function (errorSet, dataSet) {
    cache = dataSet;
});

 /**
 * Notify connected clients that there is a new value.
 */
function notifyAllClients(widget, data) {
    io.emit(widget, data);
}

// ceck all feeds
setInterval(function () {
    //console.log('io', io.nsps['/'].server.nsps['/'].server)
    fetchAllWidgetData(function (es, ds) {
        for (var widget in cache) {
            if (widget === 'nextTrain') {
                nextTrain.checkForChanges(ds, cache, io);
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

app.get('/', function (req, res) {
    if (req.query.data === 'true') {
        return res.json(cache);
    }
    res.render('layout.jade', cache);
});

app.get('/next-train/central/:station', function (req, res) {
    if (cache.nextTrain[req.params.station]) {
        return res.json(cache.nextTrain[req.params.station]);
    } else {
        nextTrain.get(req.params.station, function (error, data) {
            res.json(data);
        });
    }
});

var server = http.createServer(app);
var port =  process.env.PORT || 4000;

server.listen(port, function () {
    console.log('Listening on ' + port);
});

var io = socket.listen(server);

io.sockets.on('connection', function (socket) {
    Object.keys(nextTrain.events).forEach(function (ev) {
        socket.on(ev, nextTrain.events[ev].bind(null, socket));
    });
});
