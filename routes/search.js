
var stationCodes = require('../components/station-switcher/lib/all-stations');

module.exports = function(req, res) {
    if(req.query.station) {
        res.redirect(req.query.station);
    }
    
    // res.renderPjax('search/search', {
    //     pageId: 'search',
    //     stationCodes: stationCodes,
    //     tubes: {
    //         currentStationCode: 'SEARCH'
    //     }
    // });
};
