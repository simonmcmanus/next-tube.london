
'use strict';

var $ = require('jquery');

var template = require('./home.jade');

var switcherComp = require('../../components/station-switcher/station-switcher.js');

var NT = window.NT;

NT.pages.home = module.exports = function(context) {
        NT.activePage = 'home';
        NT.bus.trigger('zoom:out');
        if(!context.init) {
            document.title = 'Home';
            $('body').attr('data-page', 'home');
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        new switcherComp($('div.settings'), NT.bus);
        setTimeout(function() {
            $('input').eq(1).focus();
        }, 500);
};

NT.pages.home.prototype.destroy = function(callback) {
    callback();
};