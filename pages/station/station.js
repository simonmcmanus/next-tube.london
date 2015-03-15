'use strict';

var StationComp = require('../../components/station/station.js');

var FloaterComp = require('../../components/floater/floater.js');

var urlCodes = require('./station-url-codes.json');



var template = require('./station.jade');
// var templateError = require('./error.jade');


var NT = window.NT;




NT.pages.station = function(context) {
    var self = this;
    NT.$('body').attr('data-page', 'station');
    var stationCode = urlCodes[context.params.stationName];
    this.floater = new FloaterComp(NT.bus);
    this.station = new StationComp(stationCode, NT.bus);


    if(!context.init) {
        this.station.getStationData(context.canonicalPath, function(err, data) {
            if(!err) {
                console.log('do render');
                self.render({
                    station: data,
                    state: 'small'
                });
                self.setup(stationCode);
            }
        });
    } else {
        self.setup(stationCode);
    }


    return;


    // NT.bus.trigger('zoomto:station', { code: stationCode } , function() {
    //     NT.bus.trigger('zoom:finished');
    // });

    // var dataShown = false;
    // var moved = false;

    // NT.bus.trigger('moving', {}, function() {
    //     NT.bus.trigger('loading');
    //     moved = true;
    //     console.log('MOVING CHECK', dataShown, moved)
    //     if(dataShown && moved) {
    //         NT.bus.trigger('loaded');
    //     }
    // });

};

NT.pages.station.prototype.setup = function() {
    this.station.$el = NT.$('#floater');
    this.floater.$el = NT.$('#floater .content');
    this.station.directionInit();
    NT.bus.trigger('resize');
};



NT.pages.station.prototype.render = function(data) {
    NT.$('#content').html(template(data));
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