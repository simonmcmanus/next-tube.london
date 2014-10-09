var template = require('./next-train.jade');

exports.render = function(data) {
    console.log('render train status', data);
    $('#nextTrain').html(template({ 'nextTrain': data }));
};

