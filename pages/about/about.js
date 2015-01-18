
var template = require('./about.jade');

module.exports = function(page) {
    page('/about', function() {
        bus.trigger('search:hide');
        $('.page').attr('id', 'about');
        console.log(template(), template)
        $('#content').html(template());

    });
    console.log('homepage init');
}

