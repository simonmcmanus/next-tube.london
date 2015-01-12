// property updated

function makeKey(stationCode, direction, id) {
    return stationCode + '.platforms.' + direction + '.trains["' + id + '"]';
};

var train = module.exports = function(stationCode, direction, id, $el, bus) {
    var key = makeKey(stationCode, direction, id);


    this.stationCode = stationCode;
    this.direction = direction;
    this.id = id;
    this.bus = bus;
    console.log('listen', key);
    this.bus.on(key, function($el, change) {

        var $node;
        console.log('update', change.parent, $el.data('id'), change);

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


    }.bind(null, $el));
};

train.prototype.destroy = function() {
    var key = makeKey(this.stationCode, this.direction, this.id);
    this.bus.off(key);
};