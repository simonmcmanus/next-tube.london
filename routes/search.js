
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(req, res) {
    res.render('../pages/home/home.jade', {
        pageId: 'search',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'SEARCH'
        }
    });
};