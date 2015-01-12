var request = require('request');
var async = require('async');
var fix = require('./train-fixer')
var parseString = require('xml2js').parseString;

var changePath = require('../../../changePath/index');


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
                if(train1.dueIn === '-'  || train2.dueIn === '-') {
                    return -1;
                }
                return parseInt(train1.dueIn) - parseInt(train2.dueIn);
            });
        });

        callback(null, out);
    });


};


function get(key, callback) {
    console.log('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/' + key);
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

                var changes = changePath(key, cache[key], data);
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