var template = require('./next-train.jade');


exports.render = function(data) {
    var $newNode = $(template({ 'nextTrain': data}));
    $('#nextTrain').replaceWith($newNode);
    exports.bind($newNode, data);
};

exports.bind = function($node, data) {
    $node.find('select').change(stationChange);
    var stationId = (data) ? data.current.code : 'WFD';
    exports.current = stationId;
    socket.emit('next-train:station:listen:start', stationId);
};

var stationChange = function(e) {
    var newStation = e.currentTarget.selectedOptions[0].value;
    socket.emit('next-train:station:listen:stop', exports.current);
    getStationData(newStation);
};

var getStationData = function(stationCode, callback) {
    $.get('/next-train/central/' + stationCode, function(data) {
        data.current = {
            code: stationCode,
            name: 'abba'
        }
        exports.render(data);
    });
};