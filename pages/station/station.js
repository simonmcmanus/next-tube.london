'use strict';


// internal browser events bus.
var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});

// only here for debugging.
// todo: remove from window.
window.activeStation = null;
// router
var page = require('../../public/libs/page.js');
var urlCodes = require('../../fetchers/next-train/url-codes.json');

var $mapContainer = $('#map-container');
var $floater = $('#floater');
[
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
        $el: $floater.find('select'),
        init: require('../../components/station-switcher/station-switcher.js')
    }
].forEach(function(component) {
    component.init && new component.init(component.$el, bus);
});


function listen(station, socket) {
    activeStation = station.code;
    socket.emit('station:listen:start', station.code);
    socket.on('station:' + station.code + ':change', function(changes) {


var types = changes.map(function(i) {
    return i.code;
} )
        console.log(types)
        changes.forEach(function(change) {

            if(change.parent) {
                bus.trigger(change.parent, change);
            }
        });
    });
};

var stopListening = function(socket) {
    console.log('stop listening', activeStation);
    socket.emit('station:listen:stop', activeStation);
    socket.off('station:' + activeStation);
    activeStation = null;
};



// allows page change to be triggered by an event.
bus.on('page:load', function(path) {
    page(path);
});

bus.on('station', function(station) {
    stopListening(socket);
});
bus.on('nextTrain:gotStationData', function(station) {
    listen(station, socket);
});


var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
} else {
    url = 'http://localhost/';
}


var socket = io(url);


page('/central/:stationName', function(context) {
    if(context.init) {
        listen({
            code: urlCodes[context.params.stationName]
        }, socket);
    } else {
        bus.trigger('station', {
            slug: context.params.stationName,
            code: urlCodes[context.params.stationName]
        });
    }

});

page();

// window.onresize = function() {};
