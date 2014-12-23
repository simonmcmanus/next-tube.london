'use strict';

// component functionality includes.
var station = require('../station/station');

// template includes
var templateError = require('./error.jade');
var templateTrains = require('../station/station.jade');

module.exports = {
    'init': init,
    'station': getStationData,
    'nextTrain:gotStationData': render
};

function init($el, bus) {
    var $select = $el.find('select');
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    station.init($el.find('.station-detail'), bus);
}

function render(data, $el, bus) {
    var $select = $el.find('select');
    $select.attr('data-currently-listening', data.code);
    $select.val(data.code);
    $el.find('.error').empty();
    $el.find('.trains').replaceWith($(templateTrains({ station: data })));
    bus.trigger('resize');
}

function getStationData(station, $el, bus) {
    $.ajax({
        url: '/central/' + station.slug + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },
        complete: function(xhr, status) {
            console.log('complete', status)
            if(status === 'error') {
                errorCallback(station.slug, $el, bus);
            }
        },
        success: function(data) {
            bus.trigger('nextTrain:gotStationData', data);
        }
    });
}

function errorCallback(stationCode, $el, bus) {
    console.log('ERROR CALLBACK');
    $el.find('.trains').empty();
    $el.find('.error').html(templateError({stationCode: stationCode}));
    bus.trigger('resize');
    bus.trigger('loader:hide');
}

