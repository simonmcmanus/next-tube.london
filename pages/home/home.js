module.exports = function(page) {
    page('/', function() {
        console.log('trigger home');
        bus.trigger('search:hide');
        bus.trigger('station', {
            code: 'HOME'
        });

        $('.page').attr('id', 'home');

    });

    page('/search/', function() {
        console.log('trigger search');
        bus.trigger('search:show');
        $('.page').attr('id', 'search');
    });
    console.log('homepage init');
}