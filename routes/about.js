
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(req, res) {
    res.renderPjax('about/about', {
        title: 'About - next-tube.london',
        pageId: 'about',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'ABOUT'
        }
    });
};