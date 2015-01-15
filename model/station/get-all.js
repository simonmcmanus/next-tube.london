'use strict';

var async = require('async');

//var stationLister = require('../station-lister');
var getStations = require('./get');

module.exports = function (io, callback) {
    //var stations = stationLister.getAllStations();
    
    var stations = Object.keys(require('../station-lister/stations.json'));
    async.map(stations, function(station, next) {
        getStations(station, function(e, data) {
            if(data && data.changes && data.changes.length > 0) {
                io.emit('station:' + station, data.changes);
            }
            if(data && data.data) {
                next(data.data);
            }else {
                console.log('ERROR - data was', data);
                next(true);
            }
        }, true, true);
    }, callback);
};
