'use strict';

var template = require('./about.jade');

module.exports = function(NT) {
    NT.page('/about', function() {
        NT.bus.trigger('search:hide');
        $('.page').attr('id', 'about');
        console.log(template(), template);
        $('#content').html(template());
    });
    console.log('homepage init');
}

