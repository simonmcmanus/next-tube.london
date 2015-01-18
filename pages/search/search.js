var template = require('./search.jade');
module.exports = function(page) {
    page('/search/', function() {
        console.log('trigger search');
        bus.trigger('search:show');
        $('.page').attr('id', 'search');
        $('#content').html(template());
    });
    console.log('search init');
}