var template = require('./next-bus.jade');

exports.render = function(data) {
    $('#nextBus').html(template({ 'nextBus': data }));
};
