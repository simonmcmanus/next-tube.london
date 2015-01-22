'use strict';

var $ = require('jquery');

var template = require('./about.jade');

var about = module.exports = function(NT) {
    NT.page('/about', function(context) {
        if(!context.init) {
            NT.activePage = 'about';
            $('.page').attr('id', 'about');
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        NT.bus.trigger('zoom:out');
    });
    console.log('homepage init');
}


about.prototype.destroy = function(callback) {
    setTimeout(callback, 500);
};