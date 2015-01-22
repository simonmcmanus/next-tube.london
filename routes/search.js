
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(req, res) {
    res.renderPjax('search/search', {
        pageId: 'search',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'SEARCH'
        }
    });
};
