
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(model, req, res) {
    res.render('../pages/home/home.jade', {
        stationCodes: stationCodes,
        tubes: {
            currentStationCode: 'HOME'
        }
    });
};