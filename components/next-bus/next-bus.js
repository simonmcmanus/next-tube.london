var template = require('./next-bus.jade');

exports.render = function(data) {
    console.log('render bus', data);
    $('#nextBus').replaceWith(template({ 'nextBus': data }));
};
