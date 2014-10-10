var template = require('./next-train.jade');

exports.render = function(data) {
    console.log(data);
    $('#nextTrain').replaceWith(template({ 'nextTrain': data}));
};

