'use strict';

var urlCodes = require('../model/station-lister/url-codes.json');
var stations = require('../components/tubes/stations.json');
var stationCodes = require('../components/station-switcher/lib/all-stations');


module.exports = function(model, req, res) {

    var stationCode = urlCodes[req.params.station];

    if (!stationCode) {
        return res.send(404);
    }

    model.get(stationCode, function (err, data) {
        var newOut = {
            title: data.name,
            pageId: 'station',
            station: data,
            stationCodes: stationCodes,
            tubes: {
                stations: stations,
                currentStationCode: stationCode
            }
        };

        if (req.headers.accept === 'application/json' || req.query.data === 'true') {
            res.json(data);
        } else {
            res.renderPjax('station/station', newOut);
        }
    }, false);
};
