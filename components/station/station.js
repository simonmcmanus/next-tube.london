'use strict';

var platform = require('../platform/platform');

exports.bind = function($el, bus) {
    platform.bind($el.find('.platform'), bus);
    bus.on('new platform', newPlatform);
    bus.on('remove platform', removePlatform);
};


function newPlatform() {
    console.log('add new platform');

}

function removePlatform() {
    console.log('remove platform');
}