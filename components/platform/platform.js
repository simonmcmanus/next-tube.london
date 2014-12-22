'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');

var $el = exports.$el = null;

exports.init = function($el, bus) {
    train.init($el.find('.train'));
    // bus.on('new train' newTrain);
    // bus.on('remove train', removeTrain);
};

function newTrain() {
    console.log('add new train');
}

function removeTrain() {
    console.log('remove train');
}