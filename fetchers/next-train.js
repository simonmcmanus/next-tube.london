'use strict';
var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;

var stationCodes = require('./stations.json');

exports.get = function (stationCode, callback) {

    var sortTrains = function (trains) {
        if (!trains) {
            return;
        }
        return trains.map(function (train) {
            train = train.$;
            return {
                dueIn: train.TimeTo,
                destination: train.Destination,
                isStalled: (train.IsStalled === 1),
                location: train.Location
            };
        });
    };
    console.log('fetch:', stationCode);
    request('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/C/' + stationCode, function (error, data) {
        parseString(data.body, function (err, result) {
            if (!result.ROOT) {
                return callback(true);
            }
            var platforms = result.ROOT.S[0].P;
            var out = {
                    code: stationCode,
                    name: result.ROOT.S[0].$.N,
                    trains: {}
            };
            Object.keys(platforms).forEach(function (platform) {
                var direction = platforms[platform].$.N.split(' - ')[0];
                var trains = sortTrains(platforms[platform].T);

                if (!out.trains[direction]) {
                    out.trains[direction] = [];
                }
                out.trains[direction].push.apply(out.trains[direction], trains);
            });
            callback(null, out);
        });
    });
};

var getActiveRooms = function (io) {
    // still seems like its abit hacky.
    return Object.keys(io.sockets.adapter.rooms).map(function (room) {
        //TODO: should do a better check here.
        return room.split(':')[2] || false;
    }).filter(function (v) {
        return v;
    });
};

exports.getAll = function (io, callback) {
    // no io means no rooms which means not stations to check.
    var stations = (io) ? getActiveRooms(io) : ['WFD'];
    console.log('stat', stations);
    async.map(stations, exports.get, function (e, d) {
        // convert to object.
        var out = {
            stationCodes: stationCodes,
            stations: {}
        };
        d.forEach(function (item) {
            out.stations[item.code] = item;
        });
        callback(e, out);
    });
};

exports.checkForChanges = function (ds, cache, io) {
    for (var station in ds.nextTrain.stations) {
        if (cache.nextTrain.stations[station] && ds.nextTrain.stations[station]) {
            var oldTrains = cache.nextTrain.stations[station].trains;
            var newTrains = ds.nextTrain.stations[station].trains;
            if (JSON.stringify(oldTrains) !== JSON.stringify(newTrains)) {

                // strip other trains from cache, needs to change.
                var _stations = ds.nextTrain.stations;
                var out = ds.nextTrain;
                out.stations = {};
                out.stations[station] = _stations[station];
                notifyStationUpdate(station, out, io);
            }
        }else {
            notifyStationUpdate(station, ds.nextTrain, io);
        }
    }
};

// notify active users of station update.
function notifyStationUpdate(stationCode, data, io) {
    io.to('nextTrain:stations:' + stationCode).emit('updated', data.stations[stationCode]);
}

var startListening = function (socket, station) {
    console.log('join', 'nextTrain:stations:' + station);
    socket.join('nextTrain:stations:' + station);
};

var stopListening = function (socket, station) {
    console.log('leave', 'nextTrain:stations:' + station);
    socket.leave('nextTrain:stations:' + station);
};

exports.events = {
    'next-train:station:listen:start': startListening,
    'next-train:station:listen:stop': stopListening,
    'disconnected': stopListening

};
