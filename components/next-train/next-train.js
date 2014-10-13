var template = require('./next-train.jade');

exports.render = function(data) {
    var $newNode = $(template({ 'nextTrain': data}));
    $('#nextTrain').replaceWith($newNode);
    exports.bind($newNode, data);
};

exports.bind = function($node, data) {
    var $select = $node.find('select#stationCode');
    $select.change(stationChange);
    $node.find('a.change').click(function() {
        $node.find('.settings').toggleClass('hidden');
    });
    var newStation = $select.data('currentlyListening');
    socket.emit('next-train:station:listen:start', newStation);
    socket.on('nextTrain:central:' + newStation, exports.render);
};

var stationChange = function(e) {
    var oldStation = e.currentTarget.dataset['currentlyListening'];
    var newStation = e.currentTarget.selectedOptions[0].value;
    socket.off('nextTrain:central:' + oldStation);
    socket.emit('next-train:station:listen:stop', oldStation);
    getStationData(newStation);
};

var getStationData = function(stationCode, callback) {
    $.get('/next-train/central/' + stationCode, function(data, success) {
        if(success !== 'success') {
            return alert('Connection failed');
        }
        // strip out other instances, should happen on the server. 
        var stations = {};
        stations[stationCode] = data.stations[stationCode];
        data.stations = stations;
        exports.render(data);
    });
};