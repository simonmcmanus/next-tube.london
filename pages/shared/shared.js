'use strict';

var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});
var page = require('../../public/libs/page.js');

var tubesComponent = require('../../components/tubes/tubes.js');

var NT = {
    bus: bus,
    page: page,
    activePage: null,
    pages: {}
};

// page(function(context, next) {
//     if(!context.init && NT.activePage) {
//         alert('destory '+ NT.activePage);
//         pages[activePage].destroy();
//     }
//     next();
// });


$(document).ready(function() {
    new tubesComponent($('#map-container'), bus);
    // init all the pages.
    NT.pages = {
        home: require('../home/home')(NT, socket),
        //station: require('../station/station')(NT, socket),
        search: require('../search/search')(NT, socket),
        about: require('../about/about')(NT, socket)
    };

    page();
    bus.trigger('document:ready');
});

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
