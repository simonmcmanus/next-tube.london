'use strict';

var http = require('http');


var sizlate = require('sizlate')

var moment = require('moment');

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


      var toJson = require('xml2json').toJson;

      request('http://cloud.tfl.gov.uk/TrackerNet/LineStatus', function(err, res, data) {
        callback(null, JSON.parse(toJson(data)).ArrayOfLineStatus.LineStatus);
      });

    },
    selectors: function(data) {
      var newData = data.map(function(line) {
        if(line.StatusDetails === 0) {
          return false;
        }
        var out = '<li class="' + line.CssClass + ' ' + line.Line.Name.replace(/ /g, '')+ '">' + line.Line.Name + '<div><small>' + line.StatusDetails.replace(/\n/g, '</br>') + '</small></div></li>';
        return out;
      }).filter(function(item) {
        return item;
      });
//newData = 'All Lines Operational'
      if(newData.length === 0) {
        newData = 'All Lines Operational'
      }else {
        newData = newData.join('')
      }
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

  nextBus: {
    data: function(callback) {
      //http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?stopCode1=75120&returnList=EstimatedTime,longitude,latitude,StopPointName
      //http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?ReturnList=StopPointName,StopID,Towards,StopPointIndicator,StopPointState,Latitude,Longitude,VisitNumber,LineID,LineName,DirectionID,DestinationName,VehicleID,TripID,RegistrationNumber,EstimatedTime,ExpireTime&LineName=275&Circle=51.6067182,0.03675780000003215,5000
      request('http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?ReturnList=EstimatedTime,Longitude,Latitude,StopPointName,RegistrationNumber,DirectionID,Towards,StopCode1,StopCode2,StopPointType,Bearing&LineName=275&Circle=51.6067182,0.03675780000003215,5000', function(e, r, d) {
        console.log(d)
        var out = [];
        var a = d.split('\r\n');
        var c = a.length
        while(c--) {
          var bus = JSON.parse(a[c]);
          console.log('b', bus);
          out.push({
            currentLocation: bus[2],
            lat: bus[7],
            long: bus[8],
            registration: bus[6],
            bearing: bus[6],

            due: new Date(bus[7]),
          });
        }
        callback(null, out.reverse());

      });
    },
    selectors: function(data) {

      var list = data.map(function(bus) {
        return '<li>' + moment(bus).fromNow() + '</li>';
      })

      return {
        '.widget': {
            partial: 'map',
            data: [{
              id: 'nextBus',
              h2: '275 Bus',
              '.value': '<li>' + list.join('') + '</li>'
            }
            ]
        }
      }

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
      // BNK
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


      var stations = [
        { name: "Bank",  code:"BNK"},
        { name: "Barkingside",  code:"BDE"},
        { name: "Bethnal Green",  code:"BNG"},
        { name: "Bond Street",  code:"BDS"},
        { name: "Buckhurst Hill",  code:"BHL"},
        { name: "Chancery Lane",  code:"CYL"},
        { name: "Chigwell",  code:"CHG"},
        { name: "Debden",  code:"DEB"},
        { name: "Ealing Broadway",  code:"EBY"},
        { name: "East Acton",  code:"EAC"},
        { name: "Epping",  code:"EPP"},
        { name: "Fairlop",  code:"FLP"},
        { name: "Gants Hill",  code:"GHL"},
        { name: "Grange Hill",  code:"GRH"},
        { name: "Greenford",  code:"GFD"},
        { name: "Hainault",  code:"HAI"},
        { name: "Hanger Lane",  code:"HLN"},
        { name: "Holborn",  code:"HOL"},
        { name: "Holland Park",  code:"HPK"},
        { name: "Lancaster Gate",  code:"LAN"},
        { name: "Leyton",  code:"LEY"},
        { name: "Leytonstone",  code:"LYS"},
        { name: "Liverpool Street",  code:"LST"},
        { name: "Loughton",  code:"LTN"},
        { name: "Marble Arch",  code:"MAR"},
        { name: "Mile End" , code:"MLE"},
        { name: "Newbury Park",  code:"NEP"},
        { name: "North Acton",  code:"NAC"},
        { name: "Northolt",  code:"NHT"},
        { name: "Notting Hill Gate",  code:"NHG"},
        { name: "Oxford Circus",  code:"OXC"},
        { name: "Perivale",  code:"PER"},
        { name: "Queensway",  code:"QWY"},
        { name: "Redbridge",  code:"RED"},
        { name: "Roding Valley",  code:"ROD"},
        { name: "Ruislip Gardens",  code:"RUG"},
        { name: "Shepherds Bush (Central Line)",  code:"SBC"},
        { name: "Snaresbrook",  code:"SNB"},
        { name: "South Ruislip",  code:"SRP"},
        { name: "South Woodford",  code:"SWF"},
        { name: "St Pauls",  code:"STP"},
        { name: "Stratford",  code:"SFD"},
        { name: "Theydon Bois",  code:"THB"},
        { name: "Tottenham Court Road",  code:"TCR"},
        { name: "Wanstead",  code:"WAN"},
        { name: "West Acton",  code:"WAC"},
        { name: "West Ruislip",  code:"WRP"},
        { name: "White City",  code:"WCT"},
        { name: "Woodford",  code:"WFD"}
      ];


      var stationsHtml = stations.map(function(station){
        return '<option value="' + station.id + '">' +   station.name + '</option>';
      });


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
          '.value': out.join(' '),
          settings: '<select>' + stationsHtml + '</select>'
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
