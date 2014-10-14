'use strict';
var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;

var stations = require('./stations.json');

var active = {
  nextTrain: {
      keys: ['WFD'],
      users: {
          'WFD': {}
      }
  }
};

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

exports.get = function (stationCode, callback) {
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

exports.getAll = function (callback) {
  async.map(active.nextTrain.keys, exports.get, function (e, d) {
    // convert to object.
    var out = {
      stationCodes: stations,
      stations: {}
    };
    d.forEach(function (item) {
      out.stations[item.code] = item;
    });
    callback(e, out);
  });
};

exports.checkForChanges = function (ds, cache, sockets) {
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
        notifyStationUpdate(station, out, sockets);
      }
    }
  }
};

// notify active users of station update.
function notifyStationUpdate(stationCode, data, sockets) {
  console.log('notify station update', stationCode);
  var users = active.nextTrain.users[stationCode];
  Object.keys(users).forEach(function (socketId) {
    sockets[socketId].emit('nextTrain:central:' + stationCode, data.stations[stationCode]);
  });
}
// remove the station from the keys,
var deleteStation = function (stationId) {
  // always check woodford so we have something upto date for first page load.
  if (stationId !== 'WFD') {
    active.nextTrain.keys = _.without(active.nextTrain.keys, stationId);
  }
};

// does station have any active sessions listening.
var isStationEmpty = function (sessionId, station) {
  if (!active.nextTrain[station]) { // if we dont know about the station
    return true;
  }
  return (active.nextTrain[station][sessionId] === {});
};

// stops polling the api for this station.
var cleanupStations = function (sessionId, station) {
  if (isStationEmpty(sessionId, station)) {
    deleteStation(station);
  }
};

// stop listening to a station for a session id.
var stopListening = function (sessionId, station) {
  if (active.nextTrain.users[station]) { // not sure this check should be necessary.
    delete active.nextTrain.users[station][sessionId];
  }
  cleanupStations(sessionId, station);
};

var deleteActive = function (sessionId) {
  var nextTrainUsers = active.nextTrain.users;
  Object.keys(nextTrainUsers).forEach(function (station) {
    if (nextTrainUsers[station][sessionId]) {
      stopListening(sessionId, station);
    }
    cleanupStations(sessionId, station);
  });
};

var startListening = function (sessionId, station) {
  if (active.nextTrain.keys.indexOf(station) === -1) {
    active.nextTrain.keys.push(station);
  }
  if (!active.nextTrain.users[station]) {
    active.nextTrain.users[station] = {};
  }
  active.nextTrain.users[station][sessionId] = true;
};

exports.events = {
  'next-train:station:listen:start': startListening,
  'next-train:station:listen:stop': stopListening,
  'disconnect': deleteActive
};
