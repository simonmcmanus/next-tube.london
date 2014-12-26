'use strict';


// internal browser events bus.
var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});

var activeStation = null;
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
        $el: $floater.find('#station'),
        events: require('../../components/station/station.js')
    },
    {
        $el: $floater.find('select'),
        events: require('../../components/station-switcher/station-switcher.js')
    }
].forEach(function(component) {
    component.events.init && component.events.init(component.$el, bus);
    for (var ev in component.events) {
        bus.on(ev, function(ev, component) {
            // strip args added for bind and create array.
            var mainArguments = Array.prototype.slice.call(arguments, 2);
            // add $el and bus.
            mainArguments.push(component.$el, bus);
            // apply with modified arguments.
            component.events[ev].apply(null, mainArguments);
        }.bind(null, ev, component));
    }
});

function listen(station, socket) {
    activeStation = station.code;
    socket.emit('station:listen:start', station.code);
    socket.on('station:' + station.code + ':change', function(changes) {
        changes.forEach(function(change) {

            if(change.parent) {
                console.log('trigger:-->', change.parent);
                //console.log('trigger', change.parent, change);
                // chagne is not goin through
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

var stopListening = function(socket) {
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
