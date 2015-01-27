'use strict';

var $ = require('jquery');

var tubes = module.exports = function($el, bus) {
    this.$el = $el;
    this.bus = bus;
    this.$el.addClass('available');
    bus.on('station', this.focus.bind(this));
    bus.on('zoom:out', this.zoomOut.bind(this));
    bus.on('search:highlight', this.highlight.bind(this));
    this.$el.on('transitionend', this.transitionFinished.bind(this));
};

tubes.prototype.transitionFinished = function(e) {
    console.log('trans find')
    var pName =  e.propertyName || e.originalEvent.propertyName;
    if(pName === 'transform') {
        this.bus.trigger('zoom:finished');
    }
};

tubes.prototype.focus = function(station) {
    this.bus.trigger('zoom:start');
    this.$el.attr('data-station', station.code);
    this.$el.find('li.active').removeClass('active');
    $('html, body').animate({scrollTop : 0}, 500);
    $('li.' + station.code ).addClass('active');

    this.bus.on('zoom:finished', function() {
        $('ul.line li  a.point').removeClass('point');
        $('ul.line li.' + station.code + ' a').addClass('point');
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