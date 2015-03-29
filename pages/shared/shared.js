'use strict';

var TriggerBack = require('triggerback');

var bus = new TriggerBack(true);
var $ = require('jquery');

window.NT = {
    bus: bus,
    pages: {},
    $: $
};

require('pageify');
// quack.
var io = require('socket.io-client');

var attachFastClick = require('fastclick');
attachFastClick(document.body);

var tubesComponent = require('../../components/tubes/tubes.js');
var searchComponent = require('../../components/search/search.js');



// // it a page is already setup run destroy.
// page(function(context, next) {
//     var nextCalled = false;
//     if(!context.init && NT.activePage) {
//         if(NT.pages[NT.activePage].destroy) {
//             NT.pages[NT.activePage].destroy(next);
//             nextCalled = true;
//         }
//     }
//     if(!nextCalled){
//         next();
//     }
// });

NT.$(document).ready(function() {
    new tubesComponent(NT.$('.map-wrapper'), NT.bus);
    new searchComponent(NT.$('form.search'), NT.bus);
    NT.bus.trigger('document:ready');
});
// allows page change to be triggered by an event.
NT.bus.on('page:load', function(path) {
    page(path);
});

var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://www.next-tube.london/';
} else {
    url = 'http://127.0.0.1:3040/';
}

NT.$('body').addClass('js');

var socket = io(url);
