'use strict';

var template = require('./home.jade');

module.exports = function(page) {
    page('/', function() {
        bus.trigger('search:hide');
        bus.trigger('station', {
            code: 'HOME'
        });

        $('.page').attr('id', 'home');
        $('#content').html(template({
            tubes: {
                currentStationCode: 'HOME'
            }
        }));

    });
    console.log('homepage init');
};