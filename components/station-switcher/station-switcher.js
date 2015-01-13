'use strict';

module.exports = function($el, bus) {
    var $select = $el.find('select');
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
           debugger
           console.log('possible', this.currentResults.items)
           //bus.trigger('search:highlight', possibles);
        },
    });
};
