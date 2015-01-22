'use strict';

var request = require('request');
var async = require('async');
var fix = require('./train-fixer')
var parseString = require('xml2js').parseString;
var stationCodes = require('../../components/station-switcher/lib/all-stations');


var changePath = require('change-path');


var convertTrain = function (train) {
    var train = train.$;
    return {
        id: train.LCID,
        dueIn: train.TimeTo,
        destination: train.Destination,
        isStalled: (train.IsStalled === 1),
        location: train.Location
    };
};

var cache = {};


function processStation(stationXml, callback) {
    parseString(stationXml, function (err, result) {
        if (!result || !result.ROOT) {
            return false;
        }
        var platforms = result.ROOT.S[0].P;
        var out = {
            code: result.ROOT.S[0].$.Code,
            name: result.ROOT.S[0].$.N,
            stationCodes: stationCodes,
            platforms: {}
        };

        Object.keys(platforms).forEach(function (platform) {
            var direction = platforms[platform].$.Num;
            var trains = [];
            if(platforms[platform].T) {
                trains = platforms[platform].T.map(convertTrain);
                trains.sort(function(train1, train2) {
                    if(train1.dueIn === '-'  || train2.dueIn === '-') {
                        return -1;
                    }
                    return parseInt(train1.dueIn) - parseInt(train2.dueIn);
                });

            }

            //var trains = sortTrains(platforms[platform].T, platforms[platform].$.N);
            out.platforms[direction] = {
                name: platforms[platform].$.N,
                trains: trains
            }
//            out.platforms[direction].push.apply(out.platforms[direction], trains);

        });

        callback(null, out);
    });
};


function get(key, callback) {
    request('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/' + key, callback);
}

module.exports = function(stationCode, callback, incChanges, bustCache) {
    var key = 'C/' + stationCode;
    if(cache[ key ] && !bustCache) {
        callback(null, cache[ key ]);
    }else {
        get(key, function(error, data) {
            if(error) {
                return callback(error);
            }
            processStation(data.body, function(e, data) {

                var changes = changePath(stationCode, cache[key], data);
                cache[ key ] = data;
                var out = cache[ key ];

                if(incChanges) {
                    out = {
                        data: cache[ key ],
                        changes: changes
                    };
                }
                callback(null, out);
            });
        });
    }
}