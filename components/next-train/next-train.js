'use strict';

var page = require('../../public/libs/page.js');
var templateTrains = require('./trains.jade');
var templateTitle = require('./title.jade');

var listen = function (newStation, socket) {
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
            $('.widget').height($('.container').height());
            setTimeout(function() {
                $('.widget').removeClass('loading');
            }, 600);
            listen(data.code, socket);
        }
    }).fail(function (e) {
        $('#floater .trains').html('<h2>Sorry</h2><p>Error occured fetching ' + stationCode + '</p>');
    });
};

var stationChange = function (socket, e) {
    var oldStation = e.currentTarget.dataset.currentlyListening;
    var newStation = e.currentTarget.selectedOptions[0].value;
    var newStationSlug = e.currentTarget.selectedOptions[0].label.replace(/ /g, '-').toLowerCase(); 
    page('/central-line/' + newStationSlug);
    $('body').scrollTop(0)
    // socket.emit('next-train:station:listen:stop', oldStation);
    // socket.off('next-train:station:' + oldStation);
    exports.getStationData(newStationSlug, socket);
};

exports.showLoader = function() {
    $('.widget').addClass('loading');
};

exports.render = function (data) {
    console.log('render', data);
    var $node = $('#nextTrain');
    $node.find('select').attr('data-currently-listening', data.code);
    $node.find('.trains').replaceWith($(templateTrains({ station: data })));
};

exports.bind = function ($node, socket) {
    var $select = $node.find('select#stationCode');
    $select.change(stationChange.bind(null, socket));
    $node.find('a.change').click(function () {
        $node.find('.settings').toggleClass('hidden');
    });
    var newStation = $select.data('currentlyListening');
    listen(newStation, socket);
};
