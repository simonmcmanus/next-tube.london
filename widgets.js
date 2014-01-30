'use strict';

var http = require('http');


var sizlate = require('sizlate')

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
  // weather : {
  //   data: function(callback) {
  //     request('http://forecast.io/embed/#lat=42.3583&lon=-71.0603&name=Woodford', function(e, d){
  //       callback(null, d.body);
  //     })
  //   },
  //   selectors: function(data) {
  //     var out = {};
  //     out['.widget'] = {
  //       partial: 'standard',
  //       data: [{
  //         id: 'weather',
  //         h2: 'Weather for IG8',
  //         '.value': data
  //       }]
  //     }
  //     return out;
  //   }
  // },
  weather: {
    data: function(callback) {
      request('http://www.bbc.co.uk/weather/ig8', function(e, d) {
        var $ = cheerio.load(d.body);
        var page = d.body;
        callback(null, $('.hourly').html());
      })
    },
    selectors: function(data) {
      var out = {};
      out['.widget'] = {
        partial: 'standard',
        data: [{
          id: 'weather',
          h2: 'Weather for IG8',
          '.value': data
        }]
      }
      return out;
    }
  },


  tflStatus: {
    data: function(callback) {

      request('http://www.tfl.gov.uk/tfl/livetravelnews/realtime/tube/default.html', function(error, data) {
        var $ = cheerio.load(data.body);
        var items = $('#lines li');
        var out = items.map(function(i, el) {

          var text = $(this).find('h3').text();
          if(text) {
            return {
              line: text,
              status: $(this).find('div').text(),
            }
          }
        });
        callback(null, out);
        //callback(error, $('#lines').html());
      })
//      return callback(null, [{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Bakerloo"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Central"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Circle"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"District"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Hammersmith and City"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Jubilee"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Metropolitan"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Northern"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Piccadilly"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Victoria"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Waterloo and City"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"Overground"},{"ID":"GS","CssClass":"GoodService","Description":"Good Service","IsActive":"true","name":"DLR"}]);
    },
    selectors: function(data) {
      var newData = data.map(function(line) {

        if(!line.line || line.status === 'Good service') {
          return false;
        }
        var out = '<li class="' + line.CssClass + ' ' + line.line.replace(/ /g, '')+ '">' + line.line + '<div><small>' + line.status.replace(/\n/g, '</br>') + '</small></div></li>';
        return out;
      }).filter(function(item) {
        return item;
      });
newData = 'All Lines Operational'
      // if(newData.length === 0) {
      //   newData = 'All Lines Operational'
      // }else {
      //   console.log('new', newData)
      //   newData = newData.join('')
      // }
      var out = {};
      out['.widget'] = {
        partial: 'standard',
        data: [{
          id: 'tflStatus',
          h2: 'Tube Status',
          '.value': newData
        }]
      }
      return out;
    }
  },



  nextTrain: {
    data: function(callback) {


      var parseString = require('xml2js').parseString;


      var sortTrains = function(trains) {
        if(!trains) {
          return;
        }
        return trains.map(function(train) {
          train = train.$;
          return {
            dueIn: train.TimeTo,
            destination: train.Destination,
            isStalled: (train.IsStalled === 1),
            location: train.Location
          }
        })
      };

//return callback(null, {"Westbound":[{"dueIn":"1:00","destination":"West Ruislip","isStalled":false,"location":"At Woodford"},{"dueIn":"14:00","destination":"Ealing Broadway","isStalled":false,"location":"Between Theydon Bois and Debden"},{"dueIn":"17:00","destination":"White City","isStalled":false,"location":"Between Epping and Theydon Bois"}],"Eastbound":[{"dueIn":"2:00","destination":"Epping","isStalled":false,"location":"Between South Woodford and Woodford"},{"dueIn":"5:00","destination":"Debden","isStalled":false,"location":"At Snaresbrook"},{"dueIn":"8:00","destination":"Epping","isStalled":false,"location":"Approaching Leytonstone"},{"dueIn":"11:00","destination":"Grange Hill via Woodford","isStalled":false,"location":"Approaching Leyton"},{"dueIn":"13:00","destination":"Epping","isStalled":false,"location":"At Stratford"},{"dueIn":"17:00","destination":"Epping","isStalled":false,"location":"At Mile End"},{"dueIn":"23:00","destination":"Loughton","isStalled":false,"location":"Between Liverpool Street and Bethnal Green"},{"dueIn":"28:00","destination":"Epping","isStalled":false,"location":"At St. Paul's"}],"name":"nextTrain"});
      // WFD
      request('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/C/WFD', function(error, data) {

        parseString(data.body, function (err, result) {

          var platforms = result.ROOT.S[0].P;
          var out = {
            'Westbound': [],
            'Eastbound': []
          }
          for(var platform in platforms) {
            var direction = platforms[platform].$.N.slice(0, 9);
            var trains = sortTrains(platforms[platform].T);
            out[direction].push.apply(out[direction], trains);
          }
          callback(null, out)
        });

      })
    },
    selectors: function(data) {
      function train(item) {
        return '<li><span class="due">' + item.dueIn + '</span> ' + item.destination + ' - ' + '<span class="detail">' +  item.location + '</span></li>';
      };
      var out = ['<div class="direction"><h3>Westbound</h3><ul class="trains">'];
      data.Westbound.forEach(function(item) {
        out.push(train(item));
      })
      out.push('</ul></div>');
      out.push('<div class="direction"><h3>Eastbound</h3><ul  class="trains">')
      data.Eastbound.forEach(function(item) {
        out.push(train(item));
      })
      out.push('</ul></div>');

      var ret = {};
      ret['.widget'] = {
        partial: 'standard',
        data: [{
          id: 'tflStatus',
          h2: 'Central Line Train from Woodford',
          '.value': out.join(' ')
        }]
      }
      return ret;
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
  // uptime: {
  //   data: function(callback) {
  //     callback(null, {
  //       widget: 'uptime',
  //       status: 'bad',
  //       value: Math.random().toString().slice(-1),
  //       unit: 'Hours'
  //     });
  //   },
  //   selectors: selectorConverter
  // },
  // build: {
  //   data: function(callback) {
  //     callback(null, {
  //       widget: 'build',
  //       status: 'bad',
  //       value: Math.random().toString().slice(-1),
  //       unit: 'Hours'
  //     });
  //   },
  //   selectors: selectorConverter
  // },
  // flight: {
  //   data: function(callback) {
  //     callback(null, {
  //       widget: 'flight',
  //       status: 'bad',
  //       value: Math.random().toString().slice(-1),
  //       unit: 'Hours'
  //     });
  //   },
  //   selectors: selectorConverter
  // },
  // news: {
  //   data: function(callback) {
  //     http.get('api.bbcnews.appengine.co.uk/stories/technology', function(res) {
  //       callback(null, {
  //         widget: 'news',
  //         status: 'normal',
  //         value: [{
  //           title: 'Tea with milk first kills 12 people.',
  //           link: 'http://bbc.co.uk'
  //         },
  //         {
  //           title: 'Sun News tablet goes live.',
  //           link: 'http://bbc.co.uk'
  //         }]
  //       });
  //     }).on('error', function(e) {
  //       callback(e)
  //     });
  //   },

  //   /**
  //    * @param  {Array} data     expects:
  //                           value: [{
  //                             title: 'Tea with milk first kills 12 people.',
  //                             link: 'http://bbc.co.uk'
  //                           },
  //                           {
  //                             title: 'Sun News tablet goes live.',
  //                             link: 'http://bbc.co.uk'
  //                           }]
  //    * @return {[type]}      [description]
  //    */
  //   selectors: function(data) {
  //     var out = {};
  //     out['.widget'] = {
  //       partial: 'list',
  //       data: [{
  //         'id': data.widget,
  //         'h2': data.widget,
  //         '.value': data.value.map(function(listItem) {
  //           return '<li><a href="'+listItem.link+ '">'+ listItem.title + '</a></li>'
  //         }).join('')
  //       }]
  //     };
  //     return out;
  //   }
  // }


};
