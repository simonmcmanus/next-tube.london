'use strict';

var $ = require('jquery');

var stationComp = require('../../components/station/station.js');
var floaterComp = require('../../components/floater/floater.js');
var urlCodes = require('./station-url-codes.json');
var activeStation = null;

var station = module.exports = function(NT, socket) {
    var self = this;
    self.bus = NT.bus;
    self.socket = socket;
    NT.page('/:line/:stationName', self.route.bind(this));
    return this;
};


station.prototype.route = function(context) {
    var self = this;
    self.setup();
    if(!context.init) {
        $('#content').addClass('hide');
        $('.page').attr('id', 'station');
        self.bus.trigger('loader:show');
        self.getStationData(context.canonicalPath, function(data) {
            $('#content').html(data);
            self.setup();
            setTimeout(function() {
                $('#content').removeClass('hide');
            },  1200);
            var stationCode = urlCodes[context.params.stationName];
            self.bus.trigger('station', {code: stationCode});
        });

        // self.bus.trigger('station', {
        //     slug: context.params.stationName,
        //     code: urlCodes[context.params.stationName]
        // });
    }else {
        listen({
            code: urlCodes[context.params.stationName]
        }, self.socket);
    }
};


station.prototype.setup = function() {
    new stationComp($('#station'), this.bus);
    new floaterComp($('#floater'), this.bus);
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
        success: callback
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




