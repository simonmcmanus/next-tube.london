module.exports = {
    'station' : focus
};

function focus(station, $el) {
    $el.attr('data-station', station.code);
    $el.find('li.active').removeClass('active');
    $('html, body').animate({scrollTop : 0}, 500);
    $('li.' + station.code ).addClass('active');
    setTimeout(function() {
        $('ul.line li  a.point').removeClass('point');
        $('ul.line li.' + station.code + ' a').addClass('point');
    }, 1250);
};