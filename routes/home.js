
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(model, req, res) {
    res.renderPjax('home/home', {
        pageId: 'home',
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'HOME'
        }
    });
};