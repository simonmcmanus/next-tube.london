 var template = require('./search.jade');

var switcherComp = require('../../components/station-switcher/station-switcher.js');

module.exports = function(NT) {
    NT.page('/search/', function(context) {
    // trigger unbind of previous page.
         NT.activePage = 'search';

        $('#content').addClass('hide');
        $('.page').attr('id', 'search');
        $('#content').html(template());
        // setup new page.
        $('#content').addClass('hide');

        console.log('setup search')
        new switcherComp($('div.settings'), bus);
    });
    console.log('search init');
};
