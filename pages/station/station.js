'use strict';

var urlCodes = require('./station-url-codes.json');
var activeStation = null;

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
        $el: $floater.find('select'),
        init: require('../../components/station-switcher/station-switcher.js')
    }
];


module.exports = function(page, socket) {
    page('/central/:stationName', function(context) {
        bus.trigger('router:station', context);

        if(context.init) {
            listen({
                code: urlCodes[context.params.stationName]
            }, socket);

            components.forEach(function(component) {
                component.init && new component.init(component.$el, bus);
            });

        } else {
            bus.trigger('station', {
                slug: context.params.stationName,
                code: urlCodes[context.params.stationName]
            });
        }

    });
};






function listen(station, socket) {
    activeStation = station.code;
    console.log('listening to', activeStation);
    socket.on('station:' + station.code , function(changes) {
        changes.forEach(function(change) {
            if(change.parent) {
                console.log('sending', change.parent, change)
                bus.trigger(change.parent, change);
            }
        });
   });
};

// var stopListening = function(socket) {
// };




// bus.on('station', function(station) {
//     console.log('stop listening', activeStation);
//     socket.off('station:' + activeStation);
//     activeStation = null;
// });


// bus.on('nextTrain:gotStationData', function(station) {
//     listen(station, socket);
// });




