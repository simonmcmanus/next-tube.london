'use strict';

var template = require('./about.jade');

var about = module.exports = function(NT) {
    NT.page('/about', function() {
        NT.activePage = 'about';
        $('.page').attr('id', 'about');
        $('#content').html(template());
        NT.bus.trigger('zoom:out');
        $('#content').removeClass('hideTop');
    });
    console.log('homepage init');
}


about.prototype.destroy = function(callback) {
    setTimeout(callback, 500);
};