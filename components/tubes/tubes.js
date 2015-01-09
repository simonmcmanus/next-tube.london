var tubes = module.exports = function($el, bus) {
    this.$el = $el;
    bus.on('station', this.focus.bind(this));
};

tubes.prototype.focus = function(station) {
    this.$el.attr('data-station', station.code);
    this.$el.find('li.active').removeClass('active');
    $('html, body').animate({scrollTop : 0}, 500);
    $('li.' + station.code ).addClass('active');
    setTimeout(function() {
        $('ul.line li  a.point').removeClass('point');
        $('ul.line li.' + station.code + ' a').addClass('point');
    }, 1250);
};
