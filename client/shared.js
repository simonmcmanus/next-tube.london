var nextBus = require('../components/next-bus/next-bus.js');
var nextTrain = require('../components/next-train/next-train.js');
var trainStatus = require('../components/train-status/train-status.js');


if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
}else {
    url = 'http://localhost/'
}
socket = io(url);

// need to implement nextTrain:central:woodford

//socket.on('nextTrain', nextTrain.render);
socket.on('trainStatus', trainStatus.render);
socket.on('nextBus', nextBus.render);

nextTrain.bind($('#nextTrain'));
//trainStatus.bind($('#tflStatus'));
//nextBus.bind($('#nextBus'));

