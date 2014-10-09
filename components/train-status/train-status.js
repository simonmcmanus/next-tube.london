var template = require('./train-status.jade');

exports.render = function(data) {
    console.log('render train status');
    $('#tflStatus').html(template({'tflStatus': data}));
};

