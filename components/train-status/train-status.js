'use strict';

var template = require('./train-status.jade');

exports.render = function(data) {
    $('#tflStatus').replaceWith(template({'tflStatus': data}));
};

