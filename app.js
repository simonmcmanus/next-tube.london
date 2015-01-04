'use strict';

var express = require('express');
var app = express();
var async = require('async');
var socket = require('socket.io');
var http = require('http');


var POLL_INTERVAL = 5000;

var nextTrain = require('./fetchers/next-train/next-train.js');
var stations = require('./components/tubes/stations.json');
// requests always served from the cache and then updated over websockets.
var cache = {
    nextTrain: {
        station : {}
    }
};


var changePath = require('../changePath/index');

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: require('./fetchers/tfl-status.js'),
        nextTrain: nextTrain.getAll.bind(null, io)
    };
    async.parallel(methods, function (error, data) {
        callback(null, data);
    });
}


app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('../pages/home/home.jade', {
        tubes: {
            currentStationCode: 'HOME'
        }
    });
});

var getStationData = function(stationCode, callback) {
    if (cache.nextTrain.stations[stationCode]) {
        callback(null, cache.nextTrain.stations[stationCode]);
    } else {
        nextTrain.get(stationCode, function(e, d) {
            cache.nextTrain.stations[stationCode] = d;
            callback(e, d);
        });
    }
};

var urlCodes = require('./fetchers/next-train/url-codes.json');

app.get('/central/:station', function (req, res) {
    var start = +new Date();
    var stationCode = urlCodes[req.params.station];

    if (!stationCode) {
        return res.send(404);
    }

    getStationData(stationCode, function (err, data) {
        var newOut = {
            station: data,
            stationCodes: cache.nextTrain.stationCodes,
            tubes: {
                stations: stations,
                currentStationCode: stationCode
            }
        };

        if (req.headers.accept === 'application/json' || req.query.data === 'true') {
            res.json(data);
        } else {
            res.render('../pages/station/station.jade', newOut);
        }
    });
});

app.get('/central/:station/2', function (req, res) {
    var start = +new Date();
    var stationCode = urlCodes[req.params.station];

    if (!stationCode) {
        return res.send(404);
    }

    getStationData(stationCode, function (err, data) {
        var newOut = {
            station: data,
            stationCodes: cache.nextTrain.stationCodes,
            tubes: {
                stations: stations,
                currentStationCode: stationCode
            }
        };

        res.json(data.trains.Westbound.map(function(a) {
            return {
                id: a.id
            }
        }));
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


// check all feeds
setInterval(function () {
    fetchAllWidgetData(function (es, ds) {
        for (var station in ds.nextTrain.stations) {
            var changes = changePath(station,  cache.nextTrain.stations[station], ds.nextTrain.stations[station]);
            io.emit('station:' + station + ':change', changes);
        }

        cache = ds;
    });
}, POLL_INTERVAL);

io.sockets.on('connection', function (socket) {
    Object.keys(nextTrain.events).forEach(function (ev) {
        socket.on(ev, nextTrain.events[ev].bind(null, socket));
    });
});
