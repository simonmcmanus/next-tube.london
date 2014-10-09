var template = require('./train-status.jade');

exports.render = function(data) {
    console.log('render train status');
    $('#tflStatus').replaceWith(template({'tflStatus': data}));
};

