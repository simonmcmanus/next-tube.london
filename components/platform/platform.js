'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');

var $el = exports.$el = null;
exports.bind = function($el, bus) {
    $el = $el;
    train.bind($el.find('.train'));
    console.log('train');
    // bus.on('new train' newTrain);
    // bus.on('remove train', removeTrain);
};

function newTrain() {
    console.log('add new train');

}

function removeTrain() {
    console.log('remove train');
}