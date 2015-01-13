'use strict';

var urlCodes = require('./station-url-codes.json');
var activeStation = null;



module.exports = function(page, socket) {
    page('/:line/:stationName', function(context) {
        bus.trigger('router:station', context);

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




