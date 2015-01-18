
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(req, res) {
    res.renderPjax('about/about', {
        pageId: 'about',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'ABOUT'
        }
    });
};