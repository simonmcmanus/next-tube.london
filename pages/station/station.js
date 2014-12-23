'use strict';


// internal browser events bus.
var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});

// router
var page = require('../../public/libs/page.js');
var urlCodes = require('../../fetchers/next-train/url-codes.json');

var $mapContainer = $('#map-container');
var $floater = $('#floater');
[
    {
        $el: $mapContainer,
        events: require('../../components/tubes/tubes.js')
    },
    {
        $el: $floater,
        events: require('../../components/floater/floater.js')
    },
    {
        $el: $floater.find('#nextTrain'),
        events: require('../../components/next-train/next-train.js')
    },
    {
        $el: $floater.find('select'),
        events: require('../../components/station-switcher/station-switcher.js')
    }
].forEach(function(component) {
    component.events.init && component.events.init(component.$el, bus);
    for (var ev in component.events) {
        bus.on(ev, function(ev, events) {
            // strip args added for bind and create array.
            var mainArguments = Array.prototype.slice.call(arguments, 2);
            // add $el and bus.
            mainArguments.push(component.$el, bus);
            // apply with modified arguments.
            events[ev].apply(null, mainArguments);
        }.bind(null, ev, component.events));
    }
});


function listen(station, socket) {
    console.log('listen called', station.code);
    socket.emit('station:listen:start', station.code);
    socket.on('station:' + station.code + ':change', function(changes) {
        changes.forEach(function(change) {

            if(change.parent) {
                console.log('trigger', change.parent);
                bus.trigger(change.parent, change);
            }
        });
        // changes.forEach(function(change) {
        //     if (change.change === 'value changed' ) {
        //         bus.emit();
        //     }
        // });
    });
};

var stopListening = function(oldStation, socket) {
    console.log('stop listen called', oldStation.code);
    socket.emit('station:listen:stop', oldStation.code);
    socket.off('station:' + oldStation.code);
};


bus.on('page:load', function(path) {
    page(path);
});

bus.on('station', function(station) {
    stopListening(station, socket);
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

page();

console.log('000');

page('/central/:stationName', function(context) {
    bus.trigger('station', {
        slug: context.params.stationName,
        code: urlCodes[context.params.stationName]
    });
});

// window.onresize = function() {};
