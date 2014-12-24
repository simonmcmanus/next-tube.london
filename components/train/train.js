// property updated

var trainTemplate = require('./train.jade');

exports.init = function(stationCode, direction, position, $el, bus) {
    bus.on(stationCode + '.trains.' + direction + '[' + position + ']', function(change) {
        switch(change.property) {
            case 'location' :
                $el.find('.detail').css('background-color', 'yellow');
                $el.find('.detail').html(change.newValue);
                break;
            case  'dueIn' :
                $el.find('.due').css('background-color', 'yellow');
                $el.find('.due').html(change.newValue);
                break;
        }
    });
};