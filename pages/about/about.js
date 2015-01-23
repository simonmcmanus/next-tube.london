'use strict';

var $ = require('jquery');

var template = require('./about.jade');

var about = module.exports = function(NT) {
    NT.page('/about', function(context) {
        if(!context.init) {
            $('body').attr('data-page', 'about');
            NT.activePage = 'about';
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        NT.bus.trigger('zoom:out');
    });
    console.log('homepage init');
}


about.prototype.destroy = function(callback) {
    callback();
};