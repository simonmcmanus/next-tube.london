'use strict';


var allStations = require('../station-switcher/lib/all-stations.json');
var stationsObj = allStations.reduce(function(obj, item) {
    obj[item.id] = item;
    return obj;
}, {});


module.exports = function($el, bus) {
    $el.find('[type="submit"]').hide();
    var $select = $el.find('select');
    $select.change(function() {
        bus.trigger('page:load', '/' + this.value);
    });
    bus.on('station', function(station) {
        var stationDetail = stationsObj[station.code];
        $select.val(stationDetail.slug);
    });
};