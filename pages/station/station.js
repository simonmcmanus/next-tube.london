'use strict';

var StationComp = require('../../components/station/station.js');
var FloaterComp = require('../../components/floater/floater.js');
var urlCodes = require('./station-url-codes.json');


var template = require('./station.jade');
// var templateError = require('./error.jade');


var NT = window.NT;
//console.log('NT IS ', NT);

NT.pages.station = function(context) {


    // if context .init
//    console.log(context);

    // TODO - pass in correct code.
    var stationCode = urlCodes[context.params.stationName];
    console.log('station setup', stationCode)
    NT.bus.trigger('zoomto:station', { code: stationCode } , function() {
        NT.bus.trigger('zoom:finished');
    });

    // this.bus.trigger('moving', {}, function() {
    //     NT.bus.trigger('loading');
    //     self.getStationData(context.canonicalPath, function(data) {
    //         document.title = data.name;
    //         self.setup(stationCode);
    //         self.station.render(data);

    //         // set height (without animation) here.
    //         self.bus.trigger('loaded');
    //     });
    // });
};


NT.pages.station.prototype.leave = function() {

};






NT.pages.station.prototype.getStationData = function(path, callback) {
    $('.page').attr('id', 'station');
    $.ajax({
        url: path + '?ajax=true' ,
        headers: {
            'Accept': 'application/json'
        },
        complete: function(xhr, status) {
            if(status === 'error') {
                console.log("ERRROR");
                callback(true);
            }
        },
        success: callback
    });
};






// station.prototype.route = function(context) {
//     var self = this;

//     var stationCode = urlCodes[context.params.stationName];

//     if(!context.init) {
//         // we need to run this if the station if the station has been initialised previously.
//         self.bus.trigger('zoomto:station', { code: stationCode } , function() {

//             self.bus.trigger('zoom:finished');
//         });

//         this.bus.trigger('moving', {}, function() {
//             self.bus.trigger('loading');
//             self.getStationData(context.canonicalPath, function(data) {
//                 document.title = data.name;
//                 self.setup(stationCode);
//                 self.station.render(data);

//                 // set height (without animation) here.
//                 self.bus.trigger('loaded');
//             });
//         });


//     } else {
//         self.setup(stationCode);
//     }
// };


// station.prototype.setup = function(code) {

//     this.station = new stationComp($('.stationContainer'), this.bus);

//     if(this.floater) {
//         this.floater.$el = $('#floater');
//     } else {
//         this.floater = new floaterComp($('#floater'), this.bus);
//     }

//     this.listen({
//         code: code
//     });

// };

// station.prototype.destroy = function(callback) {
//     this.stopListen();
//     this.floater.setState('small', callback);
// };

// station.prototype.errorCallback = function(stationCode) {
//     this.$el.find('.trains').empty();
//     this.$el.find('.error').html(templateError({stationCode: stationCode}));
//     this.bus.trigger('error:show');
// };

// station.prototype.stopListen = function() {
//     this.socket.off('station:' + this.activeStation);
//     this.activeStation = null;
// };

// station.prototype.listen = function(station) {
//     this.activeStation = station.code;
//     this.socket.on('station:' + this.activeStation, this.stationChanges.bind(this));
// };

// station.prototype.stationChanges = function(changes) {
//     var self = this;
//     changes.forEach(function(change) {
//         if(change.parent) {
//             self.bus.trigger(change.parent, change);
//         }
//     });
// };