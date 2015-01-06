// property updated

var trainTemplate = require('./train.jade');

exports.init = function(stationCode, direction, position, $el, bus) {
    console.log('train init', stationCode + '.trains.' + direction + '[' + position + ']');
    bus.on(stationCode + '.trains.' + direction + '[' + position + ']', function(change) {
        var $node;
        switch(change.property) {
            case 'location' :
                $node = $el.find('.detail');
                $node.addClass('changed');
                setTimeout(function() {
                    $node.html(change.newValue);
                }, 500);
                setTimeout(function() {
                    $node.removeClass('changed');
                }, 1000);
                break;
            case  'dueIn' :
                $node = $el.find('.due');
                $node.addClass('changed');
                setTimeout(function() {
                    $node.html(change.newValue);
                }, 500);
                setTimeout(function() {
                    $node.removeClass('changed');
                }, 1000);
                break;
        }
    });
};