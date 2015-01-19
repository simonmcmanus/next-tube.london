'use strict';

var switcher = module.exports = function($el, bus) {
    var $select = $el.find('input.stationSearch');
    this.$el = $el;
    console.log('$select', this.hide);
    bus.on('search:hide', this.hide.bind(this));
    bus.on('search:show', this.show.bind(this));
    $select.selectize({

        persist: false,
         maxItems: 1,
         valueField: 'id',
         labelField: 'name',
         searchField: ['name', 'id'],
         options: require('./lib/all-stations.json'),

        // openOnFocus: false,
        // dataAttr: 'data-code',
        // allowEmptyOption: true,
        onChange: function(item) {
            console.log('change')
            if(item !== '') {
                var url = this.options[item].slug;
                bus.trigger('search:highlight', []);
                bus.trigger('page:load', '/' + url);
            }
        },

        onType: function(search) {
            console.log('type')
//            bus.trigger('page:load', '/search' );
           var possibles = this.currentResults.items.map(function(i) { return i.id } );
           bus.trigger('search:highlight', possibles);
        },
    });
};


switcher.prototype.hide = function() {
    this.$el.addClass('hide');
};

switcher.prototype.show = function() {
    this.$el.removeClass('hide');
};
