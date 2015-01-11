'use strict';
var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;

var stationLister = require('./station-lister');
var fix = require('./train-fixer');
var stationCodes = require('./stations.json');

exports.get = function (stationCode, callback) {

    var sortTrains = function (trains, platform) {
        if (!trains) {
            return;
        }
        return trains.map(function (train) {
            train = train.$;
            return {
                id: train.LCID,
                platform: platform,
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
                var trains = sortTrains(platforms[platform].T, platforms[platform].$.N);
                if (!out.trains[direction]) {
                    out.trains[direction] = [];
                }

                out.trains[direction].push.apply(out.trains[direction], trains);

            });
            Object.keys(out.trains).forEach(function(direction) {

                // stip out duplicate trains. 
            out.trains[direction] = fix(out.trains[direction], 'platform');

            //console.log('direction', direction, out.trains[direction]);
               out.trains[direction].sort(function(train1, train2) {
                    if(train1.dueIn === '-'  ) {
                        return -1;
                    }
                    return parseInt(train1.dueIn) - parseInt(train2.dueIn);
                })
            });

            callback(null, out);
        });
    });
};

exports.getAll = function (io, callback) {
    var stations = stationLister.getAllStations();

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
    'station:listen:start':  stationLister.add,
    'station:listen:stop': stationLister.remove,
    'disconnect': stationLister.disconnect
};
