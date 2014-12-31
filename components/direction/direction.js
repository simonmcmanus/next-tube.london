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

function delNode($el, bus) {
    /**
     * As css transistions dont work with height
     * auto we set the height explicitly.
     */
    $el.css('height', $el.outerHeight());
    setTimeout(function() {
        $el.addClass('colapsed');
    }, 0);
    // should listen for transition end event.
    setTimeout(function() {
        $el.remove();
        bus.trigger('resize');
    }, 2000);
}

function addNode($el, bus, data) {
    var $newTrainMarkup = $(trainTemplate({
        train: data.newValue
    })).addClass('added add');

    $el.find('li').eq(data.position).before($newTrainMarkup);
    setTimeout(function() {
        $newTrainMarkup.removeClass('added');
        $newTrainMarkup.bind('transitionend', function() {
            bus.trigger('resize');
            $(this).removeClass('add');
        });
    }, 0);
}

function listChange($el, bus, data) {
    if(data.change === 'item removed from list') {
        var $li = $el.find('li[data-id='+data.item + ']');
        delNode($li, bus);
    } else if(data.change === 'new item added to list') {
        addNode($el, bus, data);
    }
}