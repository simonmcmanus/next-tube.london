var nextBus = require('../components/next-bus/next-bus.js');
var nextTrain = require('../components/next-train/next-train.js');
var trainStatus = require('../components/train-status/train-status.js');

var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
}else {
    url = 'http://localhost/';
}
var socket = io(url);

nextTrain.bind($('#nextTrain'), socket);

socket.on('trainStatus', trainStatus.render);
socket.on('nextBus', nextBus.render);

$(' ul#central.line li a').click(function(e) {
    e.preventDefault();
    var newStation = this.href.split('/').pop();
    $('#map-container').attr('data-station', newStation);
    nextTrain.getStationData(newStation, socket);
});