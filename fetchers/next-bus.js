'use strict';

var request = require('request');

module.exports = function (callback) {

  request('http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?stopCode1=74662,49453&returnList=EstimatedTime,DirectionID,Towards', function (e, r, d) {
    var out = {};
    if (!d) {
      callback(true);
    }
    var a = d.split('\r\n');
    var c = a.length;
    while (c--) {
      var now = +new Date();
      var bus = JSON.parse(a[c]);
      var howLong = bus[3] - now;
      var directionId = bus[2];

      if (!out[directionId]) {
        out[directionId] = {
          direction: bus[1],
          buses: []
        };
      }

      var minutes = (howLong / 1000) / 60;
      var minsStr = '' + minutes;
      var minsArr = minsStr.split('.');
      if (minsArr[1]) {
        out[directionId].buses.push({
          to: bus[1],
          due: minsArr[0]
        });
        out[directionId].buses.reverse();
      }

    }
    callback(null, out);
  });
};
