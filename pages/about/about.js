'use strict';

var $ = require('jquery');

var template = require('./about.jade');

var about = module.exports = function(context) {
        if(!context.init) {
            $('body').attr('data-page', 'about');
            document.title = 'About';
            NT.activePage = 'about';
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }
        NT.bus.trigger('zoom:out');
};

about.prototype.destroy = function(callback) {
    callback();
};


