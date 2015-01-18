'use strict';

var template = require('./home.jade');

module.exports = function(NT) {
    NT.page('/', function() {
        bus.trigger('zoom:out');
        NT.activePage = 'home';
        $('.page').attr('id', 'home');
        $('#content').html(template({
            tubes: {
                currentStationCode: 'HOME'
            }
        }));
    });
};