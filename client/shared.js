var nextTrain = require('../components/next-train/next-train.js');
var trainStatus = require('../components/train-status/train-status.js');

var socket = io('http://localhost');


socket.on('nextTrain', nextTrain.render);
socket.on('trainStatus', trainStatus.render);

