var stationLister = require('./station-lister');

exports.events = {
    'station:listen:start':  stationLister.add,
    'station:listen:stop': stationLister.remove,
    'disconnect': stationLister.disconnect
};