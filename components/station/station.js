'use strict';

var platform = require('../platform/platform');

exports.init = function($el, bus) {
    // for each platform on the station.
    platform.init($el.find('.platform'), bus);
    bus.on('new platform', newPlatform);
    bus.on('remove platform', removePlatform);
};


function newPlatform() {
    console.log('add new platform');
}

function removePlatform() {
    console.log('remove platform');
}