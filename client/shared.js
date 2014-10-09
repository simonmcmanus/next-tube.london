var nextBus = require('../components/next-bus/next-bus.js');
var nextTrain = require('../components/next-train/next-train.js');
var trainStatus = require('../components/train-status/train-status.js');

var socket = io('http://woodford.today:80');

socket.on('nextTrain', nextTrain.render);
socket.on('trainStatus', trainStatus.render);
socket.on('nextBus', nextBus.render);

