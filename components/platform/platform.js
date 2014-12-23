'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');


exports.init = function($el, bus) {
    train.init($el.find('.train'));
    bus.on('WFD.trains.Westbound', newTrain.bind(null, $el));
    bus.on('WFD.trains.Eastbound', newTrain.bind(null, $el));
    // bus.on('remove train', removeTrain);
};

function newTrain($el) 
{
    debugger;
    $el.append($('<h1>hhiii</h1>'))
}

function removeTrain() {
    alert('remove train');
}