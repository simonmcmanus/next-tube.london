'use strict';

// internal browser events bus.
var bus = window.bus = require("../../node_modules/backbone-events-standalone").mixin({});

// router
var page = require('../../public/libs/page.js');


bus.on('page:load', function(newUrl) {
    console.log('new page', newUrl)
    page(newUrl);
})

var $floater = $('#floater');

var components = [
    // {
    //     $el: $floater.find('#nextTrain'),
    //     events: require('../../components/next-train/next-train.js')
    // },

    {
        $el: $floater.find('select'),
        events: require('../../components/station-switcher/station-switcher.js')
    },
    {
        $el: $floater,
        events: require('../../components/floater/floater.js')
    }
].forEach(function(component) {
    for (var ev in component.events) {

        component.events.init && component.events.init(component.$el, bus);
        bus.on(ev, function() {
            // make arguments real array so we add add params to the end.
            var mainArguments = Array.prototype.slice.call(arguments);
            mainArguments.push(component.$el, bus.trigger);
            component.events[ev].apply(null, mainArguments);
        });
    }

});


var listen = function (newStation, socket) {
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('next-train:station:' + newStation, exports.render);
    socket.on('next-train:station:' + newStation + ':change', function(changes) {
        changes.forEach(function(change) {
            if (change.change === 'value changed' ) {
                bus.emit();
            }
        });
    });
};




var stopListening = function(oldStation, socket) {
    socket.emit('next-train:station:listen:stop', oldStation);
    socket.off('next-train:station:' + oldStation);
};





var url;
if(window.location.hostname === 'woodford.today') {
    url = 'http://woodford.today:80/';
} else {
    url = 'http://localhost/';
}

var socket = io(url);

// setup components.
//nextTrain.bind($('#nextTrain'), socket, bus);

//floater.bind($('floater'), bus);
// socket.on('trainStatus', trainStatus.render);
// socket.on('nextBus', nextBus.render);

page();


page('/central/:stationName', function(context) {
    if(context.init) {
        // first page load.
        //nextTrain.setup(context.params.stationName, socket, bus);
    } else {
        // go get the data first.
        //nextTrain.fetch(context.params.stationName, socket, bus);
    }
});

window.onresize = nextTrain.resize;
