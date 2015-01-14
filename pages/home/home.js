module.exports = function(page) {
    page('/', function() {
        console.log('trigger home');
        bus.trigger('search:show');
        bus.trigger('station', {
            code: 'HOME'
        });

        $('.page').attr('id', 'home');

    });
    console.log('homepage init');
}