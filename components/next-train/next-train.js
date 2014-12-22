'use strict';


// component functionality includes.
var page = require('../../public/libs/page');
var station = require('../station/station');
var floater = require('../floater/floater');
var stationSwitcher = require('../station-switcher/station-switcher');

// data includes
var stationCodes = require('../../fetchers/next-train/url-codes.json');
var urlCodes = require('../../fetchers/next-train/url-codes.json');

// template includes
var templateError = require('./error.jade');
var templateTrains = require('../station/station.jade');

// called on first page load.
exports.bind = function($el, socket, bus) {
    var $select = $el.find('select');
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    listen(newStation, socket);

    // setup external components
    station.bind($el.find('div.nextTrain'), socket);
    stationSwitcher.bind($select, bus);
};

exports.fetch = function(stationName, socket, bus) {
    var code = stationCodes[stationName];
    exports.load(stationName, socket, bus);
    $('#map-container').attr('data-station', code);
    $('li.active').removeClass('active');
    //$('html, body').animate({scrollTop : 0}, 500);
    $('li a.point').removeClass('point');
    $('li.' + code ).addClass('active');
    setTimeout(function() {
        $('ul.line li.' + code + ' a').addClass('point');
    }, 1250);

};

var listen = function (newStation, socket) {
    console.log('listen', newStation);
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('next-train:station:' + newStation, exports.render);
    socket.on('next-train:station:' + newStation + ':change', function(changes) {
        changes.forEach(function(change) {
            if (change.change === 'value changed' ) {
                bus.emit();
                console.log(change);
            }
        });
    });
};



exports.getStationData = function (stationCode, socket) {
    var startTime = Date.now();
    $.ajax({
        url: '/central/' + stationCode + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },   
        success: function(data) {
            exports.render(data);
            floater.resize()
            var endTime = Date.now();
            if(startTime  > endTime - 1000) {
                // never less than 500ms so other animations can finish;
                setTimeout(hideLoader, 1000 - (endTime - startTime));
            }else {
                hideLoader();
            }
            listen(data.code, socket);
        }
    }).fail(function(e) {
        $('#floater .trains').html(templateError({stationCode: stationCode}));
        floater.resize();
        hideLoader();
    });
};

var stopListening = function(oldStation, socket) {
    console.log('stop listening', oldStation);
    socket.emit('next-train:station:listen:stop', oldStation);
    socket.off('next-train:station:' + oldStation);
};

exports.setup = function() {
    exports.bind($('#nextTrain'), socket);
};

// page changed.
exports.load = function(stationName, socket) {
    stopListening(exports.active, socket);
    exports.active = urlCodes[stationName];
    bus.trigger('loader:show');
    exports.getStationData(stationName, socket);
};


// renders the data, either from ws or http.
exports.render = function(data) {
    var $node = $('#nextTrain');
    if(exports.active !== data.code) {
        return false;
    }
    $node.find('select').attr('data-currently-listening', data.code);
    $('select').val(data.code);
    //$('body').scrollTop(0);
    $node.find('.trains').replaceWith($(templateTrains({ station: data })));
    floater.resize();
};


