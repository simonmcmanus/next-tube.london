'use strict';

var template = require('./search.jade');

var switcherComp = require('../../components/station-switcher/station-switcher.js');

var search = module.exports = function(NT) {
    NT.page('/search', function(context) {
        NT.activePage = 'search';
        if(!context.init) {
            NT.bus.trigger('zoom:out');
            $('.page').attr('id', 'search');
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        new switcherComp($('div.settings'), bus);
        setTimeout(function() {
            $('input').eq(1).focus();
        }, 500);
    });
};


search.prototype.destroy = function(callback) {
    setTimeout(callback, 500);
};