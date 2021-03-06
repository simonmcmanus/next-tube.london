'use strict';

/**
 * The fetcher needs an up to date list of stations to fetch.
 *
 * In order to do this we track when a user is added and removed from a room.
 *
 * I originally tried to replace this logic with socket.io room functionality but the list of active
 * rooms was never clean becuase it adds every connected socket to its own room. disconnection also 
 * didnt seem to work very well.
 *
 * This file also ensures lose coupling with socket.io.
 */

var _ = require('underscore');

var  active = exports.active = {
    stations: [],
    sessions: {}
};

// remove the station from the keys,
var deleteStation = function (stationId) {
    active.stations = _.without(active.stations, stationId);
};

// does station have any active sessions listening.
var isStationEmpty = function (station) {
    if (!active.sessions[station]) { // if we dont know about the station
        return true;
    }
    return _.isEmpty(active.sessions[station]);
};

// stops polling the api for this station.
var cleanupStation = function (sessionId, station) {
    if (isStationEmpty(station)) {
        deleteStation(station);
    }
};

exports.getAllStations = function () {
    return active.stations;
};

// stop listening to a station for a session id.
exports.remove = function (socket, station) {
    var socketId = socket.id;
    if (active.sessions[station]) { // not sure this check should be necessary.
        delete active.sessions[station][socketId];
    }
    cleanupStation(socketId, station);
};

exports.disconnect = function (sessionId) {
    var nextTrainUsers = active.sessions;
    Object.keys(nextTrainUsers).forEach(function (station) {
        if (nextTrainUsers[station][sessionId]) {
            exports.remove(sessionId, station);
        }
        cleanupStation(sessionId, station);
    });
};

exports.add = function (socket, stationId) {
    var socketId = socket.id;
    if (active.stations.indexOf(stationId) === -1) {
        active.stations.push(stationId);
    }
    if (!active.sessions[stationId]) {
        active.sessions[stationId] = {};
    }
    active.sessions[stationId][socketId] = true;
};
