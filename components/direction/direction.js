'use strict';

// train left
// new train added
// complete refresh

var train = require('../train/train');

var trainTemplate = require('../train/train.jade');

var stationCode = null;
var direction = null;


exports.init = function(stationCode, direction, $el, bus) {
    initChildren($el, stationCode, direction, bus);
    stationCode = stationCode;
    direction = direction;
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
    // todo - check the li exists before beforeig it? but should that be necessary?
    $el.find('li').eq(data.position).before($newTrainMarkup);

    train.init(stationCode, direction, data.newPosition, $newTrainMarkup, bus);


    setTimeout(function() {
        $newTrainMarkup.removeClass('added');
        $newTrainMarkup.bind('transitionend', function() {
            bus.trigger('resize');
            $(this).removeClass('add');
        });
    }, 0);
}

function mover($el, bus, data) {
    var $nextNewEl = $el.find('.train').eq( data.newPosition  );
    var $item  = $el.find('.train').eq(data.originalPosition);
    var itemHeight = $item.outerHeight();
    var $holderOld = $('<div class="holder">').css({
        height: $item.outerHeight()
    })

    $holderOld.insertAfter($item);

    $item.css({
        position: 'absolute',
        top: $holderOld.position().top - itemHeight,
        left: $holderOld.position().left,
    });

    $holderOld.height(0);

    var $holderNew = $('<div class="holder">');
    $holderNew.insertAfter($nextNewEl);

    $holderNew.css({
        height: $item.outerHeight()
    })
    if($nextNewEl.length < 1) {
        alert('not found');
    }

    $item.insertAfter($nextNewEl);

    $item.css({
        top: $holderNew.position().top - itemHeight,
        left: $holderNew.position().left,
    });


    setTimeout(function() {
        $holderNew.remove();
        $holderOld.remove();
        $item.css({
            position: 'relative',
            top: 'auto',
            left: 'auto'
        });
    }, 1000);

    console.log('mover', data);
}

function listChange($el, bus, data) {
    switch(data.code) {
        case 'ITEM_DELETE':
            var $li = $el.find('li[data-id=' + data.item + ']');
            delNode($li, bus);
        break;
        case 'ITEM_CREATE':
            addNode($el, bus, data);
        break;
        case 'ITEM_MOVE':
            mover($el, bus, data);
        break;
    }
}