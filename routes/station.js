//central/:station
//
var urlCodes = require('../fetchers/next-train/url-codes.json');
var stations = require('../components/tubes/stations.json');


var getStationData = function(stationCode, callback) {
    if (cache.nextTrain.stations[stationCode]) {
        callback(null, cache.nextTrain.stations[stationCode]);
    } else {
        nextTrain.get(stationCode, function(e, d) {
            cache.nextTrain.stations[stationCode] = d;
            callback(e, d);
        });
    }
};


module.exports = function(model, req, res) {

    var start = +new Date();
    var stationCode = urlCodes[req.params.station];

    if (!stationCode) {
        return res.send(404);
    }

    model.get(stationCode, function (err, data) {
        var newOut = {
            title: data.name,
            pageId: 'station',
            station: data,
            stationCodes: [],
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