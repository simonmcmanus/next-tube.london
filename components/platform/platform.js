'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');


exports.init = function($el, bus) {
    train.init($el.find('.train'));
    bus.on('WFD.trains.Westbound', newTrain.bind(null, 'Westbound', $el));
    bus.on('WFD.trains.Eastbound', newTrain.bind(null, 'Eastbound', $el));
    // bus.on('remove train', removeTrain);
};

function newTrain(direction, $el) {
    $el.find('ul[data-direction=' + direction + ']').append($('<h1>hhiii</h1>'))
    debugger;
}

function removeTrain() {
    alert('remove train');
}