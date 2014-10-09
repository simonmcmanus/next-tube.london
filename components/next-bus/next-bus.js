var template = require('./next-bus.jade');

exports.render = function(data) {
    $('#nextBus').replaceWith(template({ 'nextBus': data }));
};
