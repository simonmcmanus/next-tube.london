'use strict';

var $ = require('jquery');

var tubes = module.exports = function($el, bus) {
    this.$el = $el;
    bus.on('station', this.focus.bind(this));
    bus.on('zoom:out', this.zoomOut.bind(this));
    bus.on('search:highlight', this.highlight.bind(this));
};

tubes.prototype.focus = function(station) {
    console.log('station', station);

    this.$el.attr('data-station', station.code);
    this.$el.find('li.active').removeClass('active');
    $('html, body').animate({scrollTop : 0}, 500);
    $('li.' + station.code ).addClass('active');
    setTimeout(function() {
        $('ul.line li  a.point').removeClass('point');
        $('ul.line li.' + station.code + ' a').addClass('point');
    }, 1250);
};

tubes.prototype.unfocus = function() {
    $('ul.line li  a.point').removeClass('point');
    this.$el.find('li.active').removeClass('active');
};

tubes.prototype.highlight = function(stations) {
    var self = this;
    self.$el.find('.active').removeClass('active');
    stations.forEach(function(station) {
        self.$el.find('.' + station).addClass('active');
    });
};

tubes.prototype.zoomOut = function() {
    this.$el.attr('data-station', '');
    this.unfocus();
};