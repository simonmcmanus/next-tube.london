'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');

var trainTemplate = require('../train/train.jade');


exports.init = function(stationCode, direction, $el, bus) {
    initChildren($el, stationCode, direction, bus);
    bus.on(stationCode + '.trains.' + direction, listChange.bind(null, $el, bus));
};

function initChildren($el, stationCode, direction, bus) {
    $el.find('li.train[data-id]').each(function(index) {
        train.init(stationCode, direction, index, $(this), bus);
    });
}

function listChange($el, bus, data) {
    if(data.change === 'item removed from list') {
        // todo - animate out here
        //  stop listening.
        $el.find('li[data-id='+data.item + ']').css('background-color', 'red');
        setTimeout(function($el) {
            $el.remove();
            bus.trigger('resize');

        }.bind(null, $el.find('li[data-id='+data.item + ']')), 1000);
    } else if(data.newValue) { // new item added.
    $el.find('ul')
        // start listening.
        var $newTrainMarkup = $(trainTemplate({
            train: data.newValue
        })).css('background-color', 'green');
        $el.find('ul').append($newTrainMarkup);
        bus.trigger('resize');
    }
}