'use strict';

var toJson = require('xml2json').toJson;
var request = require('request');

module.exports = function (callback) {
  request('http://cloud.tfl.gov.uk/TrackerNet/LineStatus', function (err, res, data) {
    try {
      var status = JSON.parse(toJson(data)).ArrayOfLineStatus.LineStatus;
      callback(null, status);
    } catch (e) {
      callback(e);
    }
  });
};
