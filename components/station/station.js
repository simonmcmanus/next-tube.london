'use strict';

var $ = require('jquery');

var direction = require('../direction/direction');

var stationTemplate = require('../station/station.jade');

var station = module.exports = function(stationCode, bus) {
    this.directions = {};
    this.bus = bus;
    this.code = stationCode;
   
    bus.on('getStationData', this.getStationData.bind(this));
    //bus.on('nextTrain:gotStationData', this.render.bind(this));
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
    NT.bus.trigger('resize');
};



station.prototype.getStationData = function(path, callback) {
    var self = this;
    NT.$.ajax({
        url:  path + '?ajax=true',
        headers: {
            'Accept': 'application/json'
        }
    }).then(function(data) {
        self.data = data;
        callback(null, data);
    }).fail(function(err) {
        callback(err);
    });
};
