'use strict';

var template = require('./search.jade');

var switcherComp = require('../../components/station-switcher/station-switcher.js');

var search = module.exports = function(NT) {
    NT.page('/search', function(context) {
        console.log('in search')
         NT.activePage = 'search';
        if(!context.init) {
            $('.page').attr('id', 'search');
            $('#content').html(template());
            $('#content').removeClass('hideTop');
        }

        console.log('setup search')
        new switcherComp($('div.settings'), bus);
    });
    console.log('search init');
};


search.prototype.destroy = function(callback) {
    setTimeout(callback, 500);
};