'use strict';

var switcher = module.exports = function($el, bus) {
    var $select = $el.find('select');
    this.$el = $el;
    bus.on('search:hide', this.hide.bind(this));
    bus.on('search:show', this.show.bind(this));
    $select.selectize({
        openOnFocus: false,
        dataAttr: 'data-code',
        allowEmptyOption: true,
        onChange: function(item) {
            if(item !== '') {
                console.log(item);
                bus.trigger('page:load', item);
            }
        },

        onType: function() {
           //var possibles = this.currentResults.items.map(function(i) { return i.id } );
           console.log('possible', this.currentResults.items)
           //bus.trigger('search:highlight', possibles);
        },
    });
};


switcher.prototype.hide = function() {
    //this.$el.addClass('hide');
};

switcher.prototype.show = function() {
    this.$el.removeClass('hide');
};