


module.exports = function(page) {

    page('/about', function() {
            var aa = require('./about.jade');

        console.log('trigger about');
        bus.trigger('search:hide');
        $('.page').attr('id', 'about');
        debugger;
        $('.content').html();

    });
    console.log('homepage init');
}

