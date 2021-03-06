'use strict';

require('../../components/shared/shared.js');

var async = require('async');

var StationComp = require('../../components/station/station.js');

var FloaterComp = require('../../components/floater/floater.js');

var urlCodes = require('./station-url-codes.json');

var template = require('./station.jade');
// var templateError = require('./error.jade');

var NT = window.NT;

NT.pages.station = function(context) {
    var self = this;
    NT.$('body').attr('data-page', 'station');

    self.stationCode = urlCodes[context.params.stationName];
    self.floater = new FloaterComp(NT.bus);
    self.station = new StationComp(self.stationCode, NT.bus);
    self.floater.$el = NT.$('#floater');

    if(!context.init) {
        async.parallel({
            hideFloater: function(next) {
                NT.bus.trigger('moving', next());
            },
            zoom: function(next) {
                NT.bus.trigger('zoomto:station', { code: self.stationCode } , function() {
                    NT.bus.trigger('zoom:finished');
                    next();
                });
            },
            getData: function(next) {
                self.station.getStationData(context.canonicalPath, next);
            }
        }, function(errors, datas) {

            self.render({
                station: datas.getData,
                state: 'small'
            });
            self.floater.$el = NT.$('#floater');
            process.nextTick(function() {
                self.floater.setState('activ2e');
                self.setup();

            });

        });

    } else {
        self.setup();
    }
};



NT.pages.station.prototype.listen = function() {

  console.log('on:', 'station:' + this.stationCode);
    NT.socket.on('station:' + this.stationCode, this.stationChanges.bind(this));
};


NT.pages.station.prototype.destroy = function() {

  console.log('off:', 'station:' + this.stationCode);
  NT.socket.off('station:' + this.stationCode);
};

NT.pages.station.prototype.stationChanges = function(changes) {
    changes.forEach(function(change) {
        if(change.parent) {
          console.log(change.parent, change.code);
            NT.bus.trigger(change.parent, change);
        }
    });
};

NT.pages.station.prototype.setup = function() {
    this.station.$el = NT.$('#floater');
    NT.pages.active = this;
    this.station.directionInit();
    NT.bus.trigger('resize');
    this.listen();
};

NT.pages.station.prototype.render = function(data) {
    NT.$('#content').html(template(data));
};
