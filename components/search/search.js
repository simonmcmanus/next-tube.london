
var Search = module.exports = function($el, bus) {
    $el.find('a').click(function() {
        $el.toggleClass('open');
    });
};