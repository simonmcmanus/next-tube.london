
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(req, res) {
    res.renderPjax('home/home', {
        pageId: 'search',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'SEARCH'
        }
    });
};