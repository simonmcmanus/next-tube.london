
var stationCodes = require('../components/station-switcher/lib/all-stations');
var jade = require('jade');
var options = {
    body: jade.renderFile('./pages/home/home.jade', options),
    pageId: 'home',
    stationCodes: stationCodes,
    tubes: {
        currentStationCode: 'HOME'
    }
};

// pre-render homepage because it makes a difference to load times.
var markup = jade.renderFile('./pages/layout.jade', options);


module.exports = function(model, req, res) {
    //console.log('home')
    //return res.send('hi');
    res.send(markup);
};