
var Search = module.exports = function($el, bus) {
    $el.find('[type="submit"]').hide();
    $el.find('select').change(function() {
        bus.trigger('page:load', '/' + this.value);
    });
};