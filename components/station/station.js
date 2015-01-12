'use strict';

// component functionality includes.
var direction = require('../direction/direction');

// template includes
var templateError = require('../station/error.jade');
var templateTrains = require('../station/trains.jade');


//var stationCodes = require('../../fetchers/')


var station = module.exports = function($el, bus) {
    var $select = $el.find('select');
    this.directions = {};
    this.bus = bus;
    this.$el = $el;
    this.code = $select.data('currentlyListening');
    this.directionInit();
    bus.on('nextTrain:gotStationData', this.render.bind(this));
    bus.on('station', this.changeStation.bind(this));
};

station.prototype.changeStation = function(newStation) {

    var directions = this.directions;
    this.code = newStation.code;
    Object.keys(directions).forEach(function(direction) {
        directions[direction].destroy();
    });
    this.getStationData(newStation);
};


station.prototype.directionInit = function() {
    var self = this;
    self.$el.find('[data-direction]').each(function() {
        var dir = new direction(self.code, this.dataset.direction, $(this), self.bus);
        self.directions[this.dataset.direction] = dir;
    });
};

window.onresize = function() {
    bus.trigger('resize');
};

station.prototype.render = function(data) {
    var $el = this.$el;
    var $select = $el.find('select');
    $select.attr('data-currently-listening', data.code);
    $select.val(data.code);
    $el.find('.error').empty();
    var $newMarkup = $(templateTrains({
        station: data
    }));
    var self = this;
    // should listen for floater
    setTimeout(function() {
        $el.find('div.listing').html($newMarkup);
        self.directionInit(data.code, $el, self.bus);
        self.bus.trigger('resize');
    }, 400);
};

station.prototype.getStationData = function(station) {
    var self = this;
    self.bus.trigger('loader:show');
    $.ajax({
        url: '/central/' + station.slug + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },
        complete: function(xhr, status) {
            if(status === 'error') {
                self.errorCallback(station.slug);
            }
        },
        success: function(data) {
            self.bus.trigger('nextTrain:gotStationData', data);
            self.bus.trigger('error:hide');

            // todo: remove timeout.
            setTimeout(function() {
                self.bus.trigger('loader:hide');
            }, 500);
        }
    });
}

station.prototype.errorCallback = function(stationCode) {
    this.$el.find('.trains').empty();
    this.$el.find('.error').html(templateError({stationCode: stationCode}));
    this.bus.trigger('error:show');
}

