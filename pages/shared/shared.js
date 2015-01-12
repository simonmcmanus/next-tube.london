// internal browser events bus.
var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});
var page = require('../../public/libs/page.js');


// allows page change to be triggered by an event.
bus.on('page:load', function(path) {
    page(path);
});

var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
} else {
    url = 'http://localhost/';
}

var socket = io(url);

require('../home/home')(page, socket);
require('../station/station')(page, socket);


page();

// window.onresize = function() {};
