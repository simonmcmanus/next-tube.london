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
    'init': init,
    'nextTrain:fetch': fetch,
    'nextTrain:getStationData': getStationData,
    'nextTrain:gotStationData': render
};



function init($el, bus) {
    var $select = $el.find('select');
    var newStation = $select.data('currentlyListening');
    exports.active = newStation;
    station.init($el.find('div.nextTrain'), bus);
    bus.on();
};

function render(data, $el, bus) {

    // if(exports.active !== data.code) {
    //     return false;
    // }
    var $select = $el.find('select');
    $select.attr('data-currently-listening', data.code);
    $select.val(data.code);
    //$('body').scrollTop(0);
    //
    console.log('in refher', $el.find('.trains'));
    $el.find('.trains').replaceWith($(templateTrains({ station: data })));
    bus.trigger('resize');
};




function fetch(stationName, $el, bus) {
    var code = stationCodes[stationName];
//    exports.load(stationName, socket, bus);
//    $('#map-container').attr('data-station', code);
 //   $('li.active').removeClass('active');
    //$('html, body').animate({scrollTop : 0}, 500);
    // $('li a.point').removeClass('point');
    // $('li.' + code ).addClass('active');
    // setTimeout(function() {
    //     $('ul.line li.' + code + ' a').addClass('point');
    // }, 1250);
}


function getStationData(stationName, $el, bus) {
    console.log('aaa', arguments);
    $.ajax({
        url: '/central/' + stationName + '?ajax=true' ,
        headers: {
            Accept: 'application/json'
        },
        success: function(data) {
            bus.trigger('nextTrain:gotStationData', data);
        }
    }).fail(errorCallback.bind(null, stationName, bus));
}


function errorCallback(stationCode, bus) {
    $el.html(templateError({stationCode: stationCode}));
    bus.trigger('resize');
    bus.trigger('loader:hide');
}



// function getStationData(stationCode, $el, bus) {
//     var startTime = Date.now();
//     $.ajax({
//         url: '/central/' + stationCode + '?ajax=true' ,
//         headers: {
//             Accept: 'application/json'
//         },
//         success: function(data) {
//             exports.render(data);
//             bus.trigger('resize');
//             var endTime = Date.now();
//             if(startTime  > endTime - 1000) {
//                 // never less than 500ms so other animations can finish;
//                 setTimeout(function() {
//                     bus.trigger('loader:show');
//                 }, 1000 - (endTime - startTime));
//             }else {
//                 bus.trigger('loader:hide');
//             }
//             listen(data.code);
//         }
//     }).fail(function() {
//         $('#floater .trains').html(templateError({stationCode: stationCode}));
//         bus.trigger('resize');
//         bus.trigger('loader:hide');
//     });
// }



// // page changed.
// exports.load = function(stationName, socket, bus) {
//     stopListening(exports.active, socket);
//     exports.active = urlCodes[stationName];
//     bus.trigger('loader:show');
//     exports.getStationData(stationName, socket);
// };





