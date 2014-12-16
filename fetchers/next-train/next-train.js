'use strict';
var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;

var stationLister = require('./station-lister');

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
    request('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/C/' + stationCode, function (error, data) {
        if(error || !data.body) {
            return callback(true);
        }
        parseString(data.body, function (err, result) {
            if (!result || !result.ROOT) {
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

exports.getAll = function (io, callback) {
    var stations = stationLister.getAllStations();

    console.log(stations);
    async.map(stations, exports.get, function (e, d) {
        // convert to object.
        var out = {
            stationCodes: stationCodes,
            stations: {}
        };
        d.forEach(function (item) {
            //todo - check should not be needed.
            if(item) {
                out.stations[item.code] = item;
            }
        });
        callback(e, out);
    });
};


exports.events = {
    'next-train:station:listen:start':  stationLister.add,
    'next-train:station:listen:stop': stationLister.remove,
    'disconnect': stationLister.disconnect
};
