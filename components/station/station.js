'use strict';

// component functionality includes.
var direction = require('../direction/direction');

// template includes
var templateError = require('../station/error.jade');
var templateTrains = require('../station/trains.jade');


//var stationCodes = require('../../fetchers/')

module.exports = {
    'init': init,
    'station': getStationData,
    'nextTrain:gotStationData': render
};

function init($el, bus) {
    var $select = $el.find('select');
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    directionInit(newStation, $el, bus);
}

function directionInit(newStation, $el, bus) {
    $el.find('[data-direction]').each(function() {
        direction.init(newStation, this.dataset.direction, $(this), bus);
    });
}

window.onresize = function() {
    bus.trigger('resize');
}

function render(data, $el, bus) {
    var $select = $el.find('select');
    $select.attr('data-currently-listening', data.code);
    $select.val(data.code);
    $el.find('.error').empty();
    var $newMarkup = $(templateTrains({
        station: data
    }));
    $el.find('div.listing').html($newMarkup);
//    $el.empty();
    directionInit(data.code, $el, bus);
    bus.trigger('resize');
}

function getStationData(station, $el, bus) {
    bus.trigger('loader:show');
    $.ajax({
        url: '/central/' + station.slug + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },
        complete: function(xhr, status) {
            if(status === 'error') {
                errorCallback(station.slug, $el, bus);
            }
        },
        success: function(data) {
            bus.trigger('nextTrain:gotStationData', data);
            bus.trigger('error:hide');

            // todo: remove timeout.
            setTimeout(function() {
                bus.trigger('loader:hide');
            }, 500);
        }
    });
}

function errorCallback(stationCode, $el, bus) {

    $el.find('.trains').empty();
    $el.find('.error').html(templateError({stationCode: stationCode}));
    bus.trigger('error:show');
}

