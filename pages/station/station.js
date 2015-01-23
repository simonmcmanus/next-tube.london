'use strict';

var $ = require('jquery');

var stationComp = require('../../components/station/station.js');
var floaterComp = require('../../components/floater/floater.js');
var urlCodes = require('./station-url-codes.json');

var template = require('./station.jade');

var station = module.exports = function(NT, socket) {
    console.log('station setup')
    var self = this;
    self.bus = NT.bus;
    self.socket = socket;
    self.activeStation = null;

    NT.page('/:line/:stationName', self.route.bind(this));
    return this;
};


station.prototype.route = function(context) {

    console.log('station route');
    var self = this;
    // messsy
    NT.activePage = 'station';
    $('body').attr('data-page', 'station');
    if(!context.init) {
        $('#content').addClass('hide');
        $('.page').attr('id', 'station');
        self.bus.trigger('loader:show');
        self.getStationData(context.canonicalPath, function(data) {
            console.log(data);
            document.title = data.name;

            $('#content').html(template({
                station: data
            }));

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
    } else {
        self.setup();
    }

    self.listen({
        code: urlCodes[context.params.stationName]
    });

};


station.prototype.setup = function() {
    new stationComp($('.stationContainer'), this.bus);
    new floaterComp($('#floater'), this.bus);
};

station.prototype.destroy = function(callback) {
    console.log('statino destroy called');
    this.stopListen();
    callback();
};


station.prototype.getStationData = function(path, callback) {
    var self = this;
    $('.page').attr('id', 'station');
    $.ajax({
        url: path + '?ajax=true' ,
        headers: {
            'Accept': 'application/json',
            //'X-PJAX': 'true'
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

station.prototype.stopListen = function() {
    console.log('stop', 'station:' + this.activeStation);
    this.socket.off('station:' + this.activeStation);
    this.activeStation = null;
};


station.prototype.listen = function(station) {
     this.activeStation = station.code;
     console.log('listening to', this.activeStation);
     this.socket.on('station:' + this.activeStation, this.stationChanges.bind(this));
};


station.prototype.stationChanges = function(changes) {
    var self = this;
    
    changes.forEach(function(change) {
        console.log('got change', change);
        if(change.parent) {
            self.bus.trigger(change.parent, change);
        }
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




