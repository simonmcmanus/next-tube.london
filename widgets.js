'use strict';

var http = require('http');

var selectorConverter = function(data) {
  var out = {};
  out['.widget'] = {
    partial: 'standard',
    data: [{
      'id': data.widget,
      'h2': data.widget,
      '.value': data.value + ' ' + data.unit
    }]
  };
  return out;
};


var cheerio = require('cheerio');
var request = require('request');

module.exports = {
  tflStatus: {
    data: function(callback) {
      var out = {
        value: [{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Bakerloo"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Central"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Circle"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"District"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Hammersmith and City"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Jubilee"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Metropolitan"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Northern"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Piccadilly"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Victoria"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Waterloo and City"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Overground"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"DLR"}],
        widget: 'tflStatus',
        unit: 'hours',
        status: 'good'
      }
      return callback(null, out);
    },
    selectors: function(data) {
      var newData = data.value.map(function(line) {
        var out = '<li class="' + line.CssClass + '">' + line.name + '</li>';
        return out;
      })
      var out = {};
      out['.widget'] = {
        partial: 'tube-status',
        data: newData.join('')
      }
      return out;
    }
  },
  // nextTrain: {
  //  data: function(callback) {
  //    request(
  //      'http://www.tfl.gov.uk/tfl/livetravelnews/realtime/tube/default.html',
  //      function(error, data) {
  //      var $ = cheerio.load(data.body);
  //      callback(null, {
  //        widget: 'nextTrain',
  //        status: 'bad',
  //        value: $('#lines').html(),
  //        unit: 'Hours'
  //      });
  //    });
  //  },
  //  selectors: selectorConverter
  // },
  uptime: {
    data: function(callback) {
      callback(null, {
        widget: 'uptime',
        status: 'bad',
        value: Math.random().toString().slice(-1),
        unit: 'Hours'
      });
    },
    selectors: selectorConverter
  },
  build: {
    data: function(callback) {
      callback(null, {
        widget: 'build',
        status: 'bad',
        value: Math.random().toString().slice(-1),
        unit: 'Hours'
      });
    },
    selectors: selectorConverter
  },
  flight: {
    data: function(callback) {
      callback(null, {
        widget: 'flight',
        status: 'bad',
        value: Math.random().toString().slice(-1),
        unit: 'Hours'
      });
    },
    selectors: selectorConverter
  },
  news: {
    data: function(callback) {
      http.get('api.bbcnews.appengine.co.uk/stories/technology', function(res) {
        console.log('Got response: ' + res.statusCode);
        callback(null, {
          widget: 'news',
          status: 'normal',
          value: [{
            title: 'Tea with milk first kills 12 people.',
            link: 'http://bbc.co.uk'
          },
          {
            title: 'Sun News tablet goes live.',
            link: 'http://bbc.co.uk'
          }]
        });
      }).on('error', function(e) {
        callback(e)
      });
    },

    /**
     * @param  {Array} data     expects:
                            value: [{
                              title: 'Tea with milk first kills 12 people.',
                              link: 'http://bbc.co.uk'
                            },
                            {
                              title: 'Sun News tablet goes live.',
                              link: 'http://bbc.co.uk'
                            }]
     * @return {[type]}      [description]
     */
    selectors: function(data) {
      var out = {};
      out['.widget'] = {
        partial: 'list',
        data: [{
          'id': data.widget,
          'h2': data.widget,
          '.value': data.value.map(function(listItem) {
            return '<li><a href="'+listItem.link+ '">'+ listItem.title + '</a></li>'
          }).join('')
        }]
      };
      return out;
    }
  }


};
