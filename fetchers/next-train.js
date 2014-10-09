'use strict';
var request = require('request');

var parseString = require('xml2js').parseString;

module.exports = function(callback) {

  var sortTrains = function(trains) {
    if(!trains) {
      return;
    }
    return trains.map(function(train) {
      train = train.$;
      return {
        dueIn: train.TimeTo,
        destination: train.Destination,
        isStalled: (train.IsStalled === 1),
        location: train.Location
      }
    })
  };

  request('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/C/WFD', function(error, data) {

    parseString(data.body, function (err, result) {

      var platforms = result.ROOT.S[0].P;
      var out = {
        'Westbound': [],
        'Eastbound': []
      }
      for(var platform in platforms) {
        var direction = platforms[platform].$.N.slice(0, 9);
        var trains = sortTrains(platforms[platform].T);
        out[direction].push.apply(out[direction], trains);
      }
      callback(null, out)
    });

  })
};
