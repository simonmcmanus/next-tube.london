'use strict';

var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(model, req, res) {

    var options = {
        pageId: 'home',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'HOME'
        }
    };

    res.render('home/home', options);
};
