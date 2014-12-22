'use strict';

var $el = exports.$el = null;

var hideLoader = function() {
    $el.removeClass('loading');
};

var showLoader = function() {
    $el.addClass('loading');
};

var resize = exports.resize = function() {
    $el.height($el.find('.container').height());
    //$('#floater').width($('.container').width());
};

exports.bind = function($el, bus) {
    $el = $el;
    bus.on('loader:show', showLoader);
    bus.on('loader:hide', hideLoader);
    bus.on('resize', resize);
};





