
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(req, res) {
    res.render('../pages/about/about.jade', {

        layout: false,
        pageId: 'about',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'ABOUT'
        }
    });
};