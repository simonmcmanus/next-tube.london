'use strict';

var allStations = require('./lib/all-stations.json');

module.exports = function($el, bus) {
    console.log('setup search', $el.find('select'));
    var options = {
        keys: ['name']
    }
    var $select = $el.find('select');
    var instance = $select[0].selectize;
    console.log(instance);
    $select.selectize({
        allowEmptyOption: true,
        onChange: function(item) {
            bus.trigger('page:load', item);
        },
        onOptionAdd: function() {
            console.log('option add');
        },
        onDropdownOpen: function() {
            console.log('onDropdownOpen');
        },

        onType: function() {
            var possibles = this.currentResults.items.map(function(i) { return i.id } );
            bus.trigger('search:highlight', possibles);
        },
    });
};
