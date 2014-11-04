'use strict';

var page = require('../../public/libs/page.js');
var templateTrains = require('./trains.jade');
var templateTitle = require('./title.jade');

var listen = function (newStation, socket) {
    console.log('listen', newStation);
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('next-train:station:' + newStation, exports.render);
};

exports.getStationData = function (stationCode, socket) {

    $.ajax({
        url: '/central-line/' + stationCode,
        headers: {
            Accept: 'application/json'
        },
        success: function (data) {
            //$('.widget').removeClass('loading');
            exports.render(data);
            $('#floater').height($('.container').height());
            setTimeout(function() {
                $('#floater').removeClass('loading');
            }, 600);
            listen(data.code, socket);
        }
    }).fail(function (e) {
        $('#floater .trains').html('<h2>Sorry</h2><p>Error occured fetching ' + stationCode + '</p>');
    });
};

exports.routeChange = function() {

};

var stationChange = function (socket, e) {
    var oldStation = e.currentTarget.dataset.currentlyListening;
    var newStation = e.currentTarget.selectedOptions[0].value;
    var newStationSlug = e.currentTarget.selectedOptions[0].label.replace(/ /g, '-').toLowerCase();
    page('/central-line/' + newStationSlug);

    console.log('stop listening.', oldStation);
    socket.emit('next-train:station:listen:stop', oldStation);
    socket.off('next-train:station:' + oldStation);
    exports.getStationData(newStationSlug, socket);
};

exports.showLoader = function() {
    $('#floater').addClass('loading');
};

exports.render = function (data) {
    var $node = $('#nextTrain');
    $node.find('select').attr('data-currently-listening', data.code);
    $('select').val(data.code);
    //$('body').scrollTop(0);
    $node.find('.trains').replaceWith($(templateTrains({ station: data })));
};

exports.bind = function ($node, socket) {
    var $select = $node.find('select#stationCode');
    $select.change(stationChange.bind(null, socket));
    var newStation = $select.data('currentlyListening');
    listen(newStation, socket);
};
