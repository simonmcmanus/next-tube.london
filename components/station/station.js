'use strict';

var $ = require('jquery');

var direction = require('../direction/direction');

var stationTemplate = require('../station/station.jade');

var station = module.exports = function($el, bus) {
    this.directions = {};
    this.bus = bus;
    this.$el = $el;
    this.code = $el.data('station-code');
    this.directionInit();
    bus.on('nextTrain:gotStationData', this.render.bind(this));
    var self = this;
};

station.prototype.changeStation = function(newStation) {

    var directions = this.directions;
    this.code = newStation.code;
    Object.keys(directions).forEach(function(direction) {
        directions[direction].destroy();
    });
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
    var $newMarkup = $(stationTemplate({
        station: data,
        state: 'small'
    }));

    $el.find('div.listing').html($newMarkup);
    this.directionInit(data.code, $el, this.bus);
    this.bus.trigger('resize');
};

