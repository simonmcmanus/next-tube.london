'use strict';

var $ = require('jquery'); 

var tubes = module.exports = function($el, bus) {
    this.$el = $el;
    this.bus = bus;
    this.$el.addClass('available');
    bus.on('zoomto:station', this.focus.bind(this));
    bus.on('zoom:out', this.zoomOut.bind(this));
    bus.on('search:highlight', this.highlight.bind(this));
};

tubes.prototype.transitionFinished = function(e) {
    var pName =  e.propertyName || e.originalEvent.propertyName;
    if(pName === 'transform') {
        this.bus.trigger('zoom:finished');
    }
};

tubes.prototype.focus = function(station, callback) {
//    console.log('focus', station, callback);
    $('html, body').animate({scrollTop : 0}, 500);
    this.$el.attr('data-station', station.code);
    this.$el.find('li.active').removeClass('active z-depth-1');

    $('li.' + station.code ).addClass('active z-depth-1');
    this.$el.one('transitionend', function() {
        $('ul.line li  a.point').removeClass('point');
        $('ul.line li.' + station.code + ' a').addClass('point');
        console.log('cb', callback)
        callback();
    });
};

tubes.prototype.unfocus = function() {
    $('ul.line li  a.point').removeClass('point');
    this.$el.find('li.active').removeClass('active');
};

tubes.prototype.highlight = function(stations) {
    var self = this;
    self.$el.addClass('available');
    self.$el.find('.active').removeClass('active');
    stations.forEach(function(station) {
        self.$el.find('.' + station).addClass('active');
    });
};

tubes.prototype.zoomOut = function() {
    this.$el.attr('data-station', '');
    this.unfocus();
};