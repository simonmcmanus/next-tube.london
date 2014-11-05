'use strict';

var express = require('express');
var app = express();
var async = require('async');
var socket = require('socket.io');
var http = require('http');

var deepClone = require('underscore.deepclone');

var POLL_INTERVAL = 5000;

var nextTrain = require('./fetchers/next-train/next-train.js');
var stations = require('./components/tubes/stations.json');
// requests always served from the cache and then updated over websockets.
var cache = {};

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: require('./fetchers/tfl-status.js'),
        nextTrain: nextTrain.getAll.bind(null, io)
        //nextBus: require('./fetchers/next-bus.js')
    };
    async.parallel(methods, function (error, data) {
        callback(null, data);
    });
}

 /**
 * Notify connected clients that there is a new value.
 */
function notifyAllClients(widget, data) {
    io.emit(widget, data);
}

// check all feeds
setInterval(function () {
    fetchAllWidgetData(function (es, ds) {
        for (var widget in cache) {
            if (widget === 'nextTrain') {
                nextTrain.checkForChanges(ds, cache, function(stationId, newData) {
                    io.emit('next-train:station:' + stationId, newData);
                });
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

    cache.tubes = {
        stations : stations,
        currentStationCode: 'WFD'
    }
    res.render('layout.jade', cache);
});

var getStationData = function(stationCode, callback) {
    if (cache.nextTrain[stationCode]) {
        callback(null, cache.nextTrain[stationCode]);
    } else {
        nextTrain.get(stationCode, function(e, d) {
            cache.nextTrain[stationCode] = d;
            callback(e, d);
        });
    }
};

var urlCodes = require('./fetchers/next-train/url-codes.json');

app.get('/central/:station', function (req, res) {
    var stationCode = urlCodes[req.params.station];

    if (!stationCode) {
        return res.send(404);
    }

    getStationData(stationCode, function (err, data) {
        var newOut = {
            station: data,
            nextTrain: {
                stationCodes: cache.nextTrain.stationCodes
            },
            tubes: {
                stations: stations,
                currentStationCode: stationCode
            }
        };

        if (req.headers.accept === 'application/json') {
            res.json(data);
        } else {
            res.render('layout.jade', newOut);
        }
    });
});

var server = http.createServer(app);
var port =  process.env.PORT || 4000;

// on startup get the latest data.
fetchAllWidgetData(function (errorSet, dataSet) {
    cache = dataSet;
});

server.listen(port, function () {
    console.log('Listening on ' + port);
});

var io = socket.listen(server);

io.sockets.on('connection', function (socket) {
    Object.keys(nextTrain.events).forEach(function (ev) {
        socket.on(ev, nextTrain.events[ev].bind(null, socket));
    });
});
