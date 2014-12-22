'use strict';


// component functionality includes.
var page = require('../../public/libs/page');
var station = require('../station/station');

// data includes
var stationCodes = require('../../fetchers/next-train/url-codes.json');
var urlCodes = require('../../fetchers/next-train/url-codes.json');

// template includes
var templateError = require('./error.jade');
var templateTrains = require('../station/station.jade');



module.exports = {
    'nextTrain:fetch': fetch,
    'nextTrain:setup': setup,
    'nextTrain:getStationData': getStationData,
    'nextTrain:gotStationData': render,
};

function render(data, $el, trigger) {
    if(exports.active !== data.code) {
        return false;
    }
    var $select = $el.find('select');
    $select.attr('data-currently-listening', data.code);
    $select.val(data.code);
    //$('body').scrollTop(0);
    $el.find('.trains').replaceWith($(templateTrains({ station: data })));
    trigger('resize');
};


function setup() {
    bind($('#nextTrain'), socket);
};


function fetch(stationName, $el, trigger) {
    var code = stationCodes[stationName];
    trigger('nextTrain:gotStationData');
    exports.load(stationName, socket, bus);
    $('#map-container').attr('data-station', code);
    $('li.active').removeClass('active');
    //$('html, body').animate({scrollTop : 0}, 500);
    $('li a.point').removeClass('point');
    $('li.' + code ).addClass('active');
    setTimeout(function() {
        $('ul.line li.' + code + ' a').addClass('point');
    }, 1250);
}


function getStationData(stationCode, $el, trigger) {
    var startTime = Date.now();
    $.ajax({
        url: '/central/' + stationCode + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },
        success: function(data) {
            exports.render(data);
            trigger('resize');
            var endTime = Date.now();
            if(startTime  > endTime - 1000) {
                // never less than 500ms so other animations can finish;
                setTimeout(function() {
                    trigger('loader:show');
                }, 1000 - (endTime - startTime));
            }else {
                trigger('loader:hide');
            }
            listen(data.code);
        }
    }).fail(function() {
        $('#floater .trains').html(templateError({stationCode: stationCode}));
        trigger('resize');
        trigger('loader:hide');
    });
}


function init($el, trigger) {
    var $select = $el.find('select');
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    listen(newStation, socket);

    // setup external components
    station.bind($el.find('div.nextTrain'), socket, bus);
    stationSwitcher.bind($select, bus);
};

// page changed.
exports.load = function(stationName, socket, bus) {
    stopListening(exports.active, socket);
    exports.active = urlCodes[stationName];
    bus.trigger('loader:show');
    exports.getStationData(stationName, socket);
};





