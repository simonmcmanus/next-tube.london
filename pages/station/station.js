'use strict';

// internal browser events bus.
var bus = require("../node_modules/backbone-events-standalone").mixin({});

var page = require('../public/libs/page.js');
var nextTrain = require('../components/next-train/next-train.js');

var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
} else {
    url = 'http://localhost/';
}

var socket = io(url);

// setup components.
nextTrain.bind($('#nextTrain'), socket, bus);

// socket.on('trainStatus', trainStatus.render);
// socket.on('nextBus', nextBus.render);

page();

page('/central/:stationName', function(context) {
    if(context.init) {
        // first page load.
        //nextTrain.setup(context.params.stationName, socket, bus);
    } else {
        // go get the data first.
        nextTrain.fetch(context.params.stationName, socket, bus);
    }
});


window.onresize = nextTrain.resize;
