'use strict';

var page = require('../../public/libs/page.js');
var templateTrains = require('./trains.jade');
var templateTitle = require('./title.jade');
var urlCodes = require('../../fetchers/next-train/url-codes.json');

var listen = function (newStation, socket) {
    console.log('listen', newStation);
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('next-train:station:' + newStation, exports.render);
};

var hideLoader = function() {
    $('#floater').removeClass('loading');
};

var showLoader = function() {
    $('#floater').addClass('loading');
};

exports.getStationData = function (stationCode, socket) {

    $.ajax({
        url: '/central-line/' + stationCode,
        headers: {
            Accept: 'application/json'
        },
        success: function (data) {

            exports.render(data);
            $('#floater').height($('.container').height());
            // couldnt get this delay only working with css to delay
            // removing the opacity. Seems odd to delay showing the user the
            // data but makes the experience much nicer (less jumpy).
            setTimeout(hideLoader, 500);
            listen(data.code, socket);
        }
    }).fail(function (e) {
        $('#floater .trains').html('<h2>Sorry</h2><p>Error occured fetching ' + stationCode + '</p>');
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
    showLoader();
    exports.getStationData(stationName, socket);
};

// triggered by select drop down.
var stationChange = function(socket, e) {
    // woo hack! - should come from the json file.
    var newStationSlug = e.currentTarget.selectedOptions[0].label.replace(/ /g, '-').toLowerCase();
    page('/central-line/' + newStationSlug);
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
};

// called on first page load.
exports.bind = function ($node, socket) {
    var $select = $node.find('select#stationCode');
    $select.change(stationChange.bind(null, socket));
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    listen(newStation, socket);
};
