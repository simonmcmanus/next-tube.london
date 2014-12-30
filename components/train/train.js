// property updated

var trainTemplate = require('./train.jade');

exports.init = function(stationCode, direction, position, $el, bus) {
    bus.on(stationCode + '.trains.' + direction + '[' + position + ']', function(change) {
        var $node;
        switch(change.property) {
            case 'location' :
                $node = $el.find('.detail');
                $node.html(change.newValue);
                break;
            case  'dueIn' :
                $node = $el.find('.due');
                $node.html(change.newValue);
                break;
        }
    });
};
