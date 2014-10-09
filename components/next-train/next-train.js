var template = require('./next-train.jade');

exports.render = function(data) {
    $('#nextTrain').html(template({ 'nextTrain': data }));
};

