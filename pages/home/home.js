'use strict';

var template = require('./home.jade');

var home = module.exports = function(NT) {
    NT.page('/', function() {
        console.log('in home')
        NT.bus.trigger('zoom:out');
        NT.activePage = 'home';
        $('.page').attr('id', 'home');
        $('#content').html(template({
            tubes: {
                currentStationCode: 'HOME'
            }
        }));
//        $('#content').removeClass('hideTop');
    });
    return this;
};

home.prototype.destroy = function(callback) {
    callback();
    console.log('desory home');
}