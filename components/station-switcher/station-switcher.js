'use strict';

exports.bind = function($el, bus) {
    var $select = $el.find('select#stationCode');
    console.log('sel', $select);
    $select.change(stationChange);
};

var stationChange = function(e) {
    alert('hi')
    console.log('hi1')
    var newStationSlug = e.currentTarget.selectedOptions[0].label.replace(/ /g, '-').toLowerCase();
    console.log('hi2')
    page('/central/' + newStationSlug);
};

