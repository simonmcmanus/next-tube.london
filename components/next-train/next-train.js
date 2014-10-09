var template = require('./next-train.jade');

exports.render = function(data) {
    $('#nextTrain').replaceWith(template({ 'nextTrain': data }));
};

