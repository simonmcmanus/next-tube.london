'use strict';

var $  = window.jQuery = require('jquery');
var io = require('socket.io-client');

var attachFastClick = require('fastclick');
attachFastClick(document.body);


var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});


var TriggerBack = require('../../../triggerback/index');
var bus = new TriggerBack(true);

var page = require('../../public/libs/page.js');

var tubesComponent = require('../../components/tubes/tubes.js');
var searchComponent = require('../../components/search/search.js');
//var SearchPage = require('../search/search');
var HomePage = require('../home/home');
var StationPage = require('../station/station');
var AboutPage = require('../about/about');

window.NT = {
    bus: bus,
    page: page,
    activePage: null,
    pages: {}
};


// it a page is already setup run destroy.
page(function(context, next) {
    var nextCalled = false;
    if(!context.init && NT.activePage) {
        if(NT.pages[NT.activePage].destroy) {
            NT.pages[NT.activePage].destroy(next);
            nextCalled = true;
        }
    }
    if(!nextCalled){
        next();
    }
});

$(document).ready(function() {
    new tubesComponent($('.map-wrapper'), bus);
    new searchComponent($('form.search'), bus);
    // init all the pages.

    NT.pages = {
        home: new HomePage(NT, socket),
        station: new StationPage(NT, socket),
//        search: new SearchPage(NT, socket),
        about: new AboutPage(NT, socket)
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
    url = 'http://www.next-tube.london/';
} else {
    url = 'http://127.0.0.1:4000/';
}

var socket = io(url);
