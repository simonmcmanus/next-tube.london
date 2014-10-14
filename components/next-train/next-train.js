'use strict';

var templateTrains = require('./trains.jade');
var templateTitle = require('./title.jade');

var getStationData = function (stationCode) {
  $.get('/next-train/central/' + stationCode, function (data) {
    exports.render(data);
  }).fail(function () {
    alert('http request failed');
  });
};

var stationChange = function (e) {
  var oldStation = e.currentTarget.dataset.currentlyListening;
  var newStation = e.currentTarget.selectedOptions[0].value;
  socket.off('nextTrain:central:' + oldStation);
  socket.emit('next-train:station:listen:stop', oldStation);
  getStationData(newStation);
};

var listen = function (newStation) {
  socket.emit('next-train:station:listen:start', newStation);
  socket.on('nextTrain:central:' + newStation, exports.render);
};

exports.render = function (data) {
  console.log('render', data);
  var $node = $('#nextTrain');
  $node.find('.title').replaceWith($(templateTitle({ station: data })));
  $node.find('.trains').replaceWith($(templateTrains({ station: data })));
  listen(data.code);
};

exports.bind = function ($node) {
  var $select = $node.find('select#stationCode');
  $select.change(stationChange);
  $node.find('a.change').click(function () {
    $node.find('.settings').toggleClass('hidden');
  });
  var newStation = $select.data('currentlyListening');
  listen(newStation);
};
