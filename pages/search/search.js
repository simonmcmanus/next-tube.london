module.exports = function(page) {
    page('/search/', function() {
        console.log('trigger search');
        bus.trigger('search:show');
        $('.page').attr('id', 'search');
    });
    console.log('search init');
}