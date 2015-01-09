// property updated

function makeKey(stationCode, direction, id) {
    return stationCode + '.trains.' + direction + '["' + id + '"]';
};

var train = module.exports = function(stationCode, direction, id, $el, bus) {
    var key = makeKey(stationCode, direction, id);

    this.stationCode = stationCode;
    this.direction = direction;
    this.id = id;
    this.bus = bus;
    this.bus.on(key, function(change) {
        console.log('update', key);
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

train.prototype.destroy = function() {
    var key = makeKey(this.stationCode, this.direction, this.id);
    this.bus.off(key);
};