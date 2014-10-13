 var express = require('express');
 var app = express();
var async = require('async');
var socket = require('socket.io');
var http = require('http');
var _ = require('underscore');

var active = {
    nextTrain: {
        keys: ['WFD'],
        users: {
            'WFD': {}
        }
    }
};

var deleteActive = function(sessionId) {
    var nextTrainUsers = active.nextTrain.users;
    for(station in nextTrainUsers) {
        if(nextTrainUsers[station][sessionId]) {
            stopListening(sessionId, station);
        }
        cleanupStations(sessionId, station);
    }
};

// stops polling the api for this station.
var cleanupStations = function(sessionId, station) {
    if(isStationEmpty(sessionId, station)) {
        deleteStation(station);
    }
};

// does station have any active sessions listening.
var isStationEmpty = function(sessionId, station) {
    if(!active.nextTrain[station]) { // if we dont know about the station
        return true;
    }
    return (active.nextTrain[station][sessionId] == {});
};

// stop listening to a station for a session id.
var stopListening = function(sessionId, station) {
    if(active.nextTrain.users[station]) { // not sure this check should be necessary.
        delete active.nextTrain.users[station][sessionId];
    }
    cleanupStations(sessionId, station);
};

// remove the station from the keys,
var deleteStation = function(stationId) {
    // always check woodford so we have something upto date for first page load.
    if(stationId !== 'WFD') {
        active.nextTrain.keys = _.without(active.nextTrain.keys, stationId);
    }
};

var startListening = function(sessionId, station) {
    if(active.nextTrain.keys.indexOf(station) == -1) {
        active.nextTrain.keys.push(station);
    }
    if(!active.nextTrain.users[station]) {
        active.nextTrain.users[station] = {};
    }
    active.nextTrain.users[station][sessionId] = true;
};

var nextTrain = require('./fetchers/next-train.js');
// requests always served from the cache and then updated over websockets.
var cache = {};
var cacheHttp = {};

/**
 * Gets the latest values for all the widgets.
 * @param  {Function} callback Called when fetched the completed data
 */
function fetchAllWidgetData(callback) {
    var methods = {
        tflStatus: require('./fetchers/tfl-status.js'),
        nextTrain: function(next) {
            nextTrain(active.nextTrain.keys, next);
        },
        nextBus: require('./fetchers/next-bus.js')
    };
    async.parallel(methods, function(error, data) {
        callback(null, data);
    });
};

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
// notify active users of station update.
function notifyStationUpdate(stationCode, data) {
    var users = active.nextTrain.users[stationCode];
    for(var socketId in users) {
        sockets[socketId].emit('nextTrain:central:'+stationCode, data);
    }
}

setInterval(function() {
    fetchAllWidgetData(function(es, ds) {
        for (var widget in cache) {
            if(widget === 'nextTrain') {
                for(station in ds.nextTrain.stations) {
                    if(cache.nextTrain.stations[station] && ds.nextTrain.stations[station]) {
                        var oldTrains = cache.nextTrain.stations[station].trains;
                        var newTrains = ds.nextTrain.stations[station].trains
                        if (JSON.stringify(oldTrains) != JSON.stringify(newTrains)) {

                            // strip other trains from cache, needs to change.
                            var _stations = ds.nextTrain.stations;
                            var out = ds.nextTrain;
                            out.stations = {};
                            out.stations[station] = _stations[station];
                            notifyStationUpdate(station, out);
                        }
                    }
                }
            } else {
                if (JSON.stringify(cache[widget]) != JSON.stringify(ds[widget])) {
                    notifyAllClients(widget, ds[widget]);
                }                
            }
        };
        cache = ds;
    });
}, 10000);

app.use(express.static('public')); 

app.get("/", function(req, res) {
    if(req.query.data == 'true') {
        return res.json(cache);
    }
    res.render('layout.jade', cache);
});

app.get("/next-train/:line/:station", function(req, res) {
    if(cache.nextTrain[req.params.station]) {
        return res.json(cache.nextTrain[req.params.station]);
    } else {
        nextTrain([req.params.station], function(error, data) {
            res.json(data);
        });        
    }
});

var server = http.createServer(app); 
var port =  process.env.PORT || 4000;
server.listen(port, function() {
    console.log("Listening on " + port);
});

var io = socket.listen(server);
var sockets = {};

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;

    socket.on('next-train:station:listen:start', function(stationId) {
        startListening(socket.id, stationId);
    });

    socket.on('next-train:station:listen:stop', function(stationId) {
        stopListening(socket.id, stationId);
    });

    socket.on('disconnect', function() {
        deleteActive(socket.id);
        delete sockets[socket.id];
    });
});
