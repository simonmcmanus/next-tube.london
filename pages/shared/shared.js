// internal browser events bus.
var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});
var page = require('../../public/libs/page.js');


// only exposing for debugging.
window.NT = {
    bus: bus,
    page: page
};

var $mapContainer = $('#map-container');
var $floater = $('#floater');
var components = [
    {
        $el: $mapContainer,
        init: require('../../components/tubes/tubes.js')
    },
    {
        $el: $floater,
        init: require('../../components/floater/floater.js')
    },
    {
        $el: $floater.find('#station'),
        init: require('../../components/station/station.js')
    },
    {
        $el: $('div.settings'),
        init: require('../../components/station-switcher/station-switcher.js')
    }
];

$(document).ready(function() {
    components.forEach(function(component) {
        component.init && new component.init(component.$el, bus);
    });
})

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

// page(function(context, next) {
//     if(!context.init) {
//         $.ajax({
//             url: context.canonicalPath + '?&pjax=true',
//             success: function(data) {
//                 debugger;
//             }
//         });
//     }
// })

require('../home/home')(page, socket);
require('../station/station')(page, socket);
require('../search/search')(page, socket);
require('../about/about')(page, socket);


page();

// window.onresize = function() {};
