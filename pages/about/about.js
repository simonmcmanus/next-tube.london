'use strict';


var template = require('./about.jade');

NT.pages.about = module.exports = function(context) {
        if(!context.init) {
            NT.$('body').attr('data-page', 'about');
            document.title = 'About';
            NT.$('#content').html(template());
        }
        NT.bus.trigger('zoom:out');
};

NT.pages.about.prototype.destroy = function(callback) {
    callback();
};

