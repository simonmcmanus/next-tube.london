'use strict';

module.exports = function(data) {

  var stationsHtml = data.stations.map(function(station){
    return '<option value="' + station.id + '">' +   station.name + '</option>';
  });

  function train(item) {
    return '<li><span class="due">' + item.dueIn + '</span> ' + item.destination + ' - ' + '<span class="detail">' +  item.location + '</span></li>';
  }

  var out = ['<div class="direction"><h3>Westbound</h3><ul class="trains">'];
  data.Westbound.forEach(function(item) {
    out.push(train(item));
  });
  out.push('</ul></div>');
  out.push('<div class="direction"><h3>Eastbound</h3><ul  class="trains">')
  data.Eastbound.forEach(function(item) {
    out.push(train(item));
  });
  out.push('</ul></div>');

  var ret = {};
  ret['.widget'] = {
    partial: 'standard',
    data: [{
      id: 'tflStatus',
      h2: 'Central Line Train from Woodford',
      '.value': out.join(' '),
      'settings': '<select>' + stationsHtml + '</select>'
    }]
  };
  return ret;
};
