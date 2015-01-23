'use strict';

var $ = require('jquery');

var template = require('./home.jade');

var switcherComp = require('../../components/station-switcher/station-switcher.js');

var home = module.exports = function(NT) {
    NT.page('/', function(context) {
        NT.activePage = 'home';
        NT.bus.trigger('zoom:out');
        if(!context.init) {
            document.title = 'Home';
            $('body').attr('data-page', 'home');
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        new switcherComp($('div.settings'), bus);
        setTimeout(function() {
            $('input').eq(1).focus();
        }, 500);
    });
};

home.prototype.destroy = function(callback) {
    callback();
};