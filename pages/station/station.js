'use strict';
var stationComp = require('../../components/station/station.js');
var floaterComp = require('../../components/floater/floater.js');
var urlCodes = require('./station-url-codes.json');
var activeStation = null;

var station = module.exports = function(NT, socket) {
    var self = this;
    self.bus = NT.bus;
    self.bus.on('setup', function() {
        new stationComp($('#station'), bus);
        new floaterComp($('#floater'), bus);
    });
    NT.page('/:line/:stationName', function(context) {

        if(!context.init) {
            self.bus.trigger('loader:show');
            $('#content').removeClass('hideTop');
            var stationCode = urlCodes[context.params.stationName];
            self.getStationData(context.canonicalPath, function() {
                console.log('got', stationCode);
                self.bus.trigger('station', {code: stationCode});

                //debugger;
            });
        }
        // console.log('got for station /line/station');


        // bus.trigger('router:station', context);
        // if(context.init) {
        //     listen({
        //         code: urlCodes[context.params.stationName]
        //     }, socket);
        // } else {

        //     $('.page').attr('id', 'station');
        //     bus.trigger('station', {
        //         slug: context.params.stationName,
        //         code: urlCodes[context.params.stationName]
        //     });
        // }
        //$('#content').removeClass('hideTop');

    });
    return this;
};


station.prototype.destroy = function(callback) {
    console.log('1');
    callback();

};


station.prototype.getStationData = function(path, callback) {
    var self = this;
    $('.page').attr('id', 'station');
    $.ajax({
        url: path + '?ajax=true' ,
        headers: {
            //'Accept': 'application/json',
            'X-PJAX': 'true'
        },
        complete: function(xhr, status) {
            if(status === 'error') {
                console.log("ERRROR");
                callback(true);
            }
        },
        success: function(data) {
            $('#content').html(data);
            callback(null);
//            console.log(data);
            // self.bus.trigger('nextTrain:gotStationData', data);
            // self.bus.trigger('error:hide');
            // // todo: remove timeout.
            // setTimeout(function() {
            //     self.bus.trigger('loader:hide');
            // }, 500);
        }
    });
};

station.prototype.errorCallback = function(stationCode) {
    this.$el.find('.trains').empty();
    this.$el.find('.error').html(templateError({stationCode: stationCode}));
    this.bus.trigger('error:show');
}

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




