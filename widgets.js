// 'use strict';


 // this file is not used 

// //only kept here for reference






















// var http = require('http');



// var moment = require('moment');
// var cheerio = require('cheerio');
// var selectorConverter = function(data) {
//   var out = {};
//   out['.widget'] = {
//     partial: 'standard',
//     data: [{
//       'id': data.widget,
//       'h2': data.widget,
//       '.value': data.value + ' ' + data.unit
//     }]
//   };
//   return out;
// };


// var request = require('request');

// module.exports = {
//   // weather : {
//   //   data: function(callback) {
//   //     request('http://forecast.io/embed/#lat=42.3583&lon=-71.0603&name=Woodford', function(e, d){
//   //       callback(null, d.body);
//   //     })
//   //   },
//   //   selectors: function(data) {
//   //     var out = {};
//   //     out['.widget'] = {
//   //       partial: 'standard',
//   //       data: [{
//   //         id: 'weather',
//   //         h2: 'Weather for IG8',
//   //         '.value': data
//   //       }]
//   //     }
//   //     return out;
//   //   }
//   // },

//   // was in use:
//   // weather: {
//   //   data: function(callback) {
//   //     request('http://www.bbc.co.uk/weather/ig8', function(e, d) {
//   //       var $ = cheerio.load(d.body);
//   //       var page = d.body;
//   //       callback(null, $('.hourly').html());
//   //     })
//   //   },
//   //   selectors: function(data) {
//   //     var out = {};
//   //     out['.widget'] = {
//   //       partial: 'standard',
//   //       data: [{
//   //         id: 'weather',
//   //         h2: 'Weather for IG8',
//   //         '.value': data
//   //       }]
//   //     }
//   //     return out;
//   //   }
//   // },


//     selectors: function(data) {


//       var stations = [
//         { name: "Bank",  code:"BNK"},
//         { name: "Barkingside",  code:"BDE"},
//         { name: "Bethnal Green",  code:"BNG"},
//         { name: "Bond Street",  code:"BDS"},
//         { name: "Buckhurst Hill",  code:"BHL"},
//         { name: "Chancery Lane",  code:"CYL"},
//         { name: "Chigwell",  code:"CHG"},
//         { name: "Debden",  code:"DEB"},
//         { name: "Ealing Broadway",  code:"EBY"},
//         { name: "East Acton",  code:"EAC"},
//         { name: "Epping",  code:"EPP"},
//         { name: "Fairlop",  code:"FLP"},
//         { name: "Gants Hill",  code:"GHL"},
//         { name: "Grange Hill",  code:"GRH"},
//         { name: "Greenford",  code:"GFD"},
//         { name: "Hainault",  code:"HAI"},
//         { name: "Hanger Lane",  code:"HLN"},
//         { name: "Holborn",  code:"HOL"},
//         { name: "Holland Park",  code:"HPK"},
//         { name: "Lancaster Gate",  code:"LAN"},
//         { name: "Leyton",  code:"LEY"},
//         { name: "Leytonstone",  code:"LYS"},
//         { name: "Liverpool Street",  code:"LST"},
//         { name: "Loughton",  code:"LTN"},
//         { name: "Marble Arch",  code:"MAR"},
//         { name: "Mile End" , code:"MLE"},
//         { name: "Newbury Park",  code:"NEP"},
//         { name: "North Acton",  code:"NAC"},
//         { name: "Northolt",  code:"NHT"},
//         { name: "Notting Hill Gate",  code:"NHG"},
//         { name: "Oxford Circus",  code:"OXC"},
//         { name: "Perivale",  code:"PER"},
//         { name: "Queensway",  code:"QWY"},
//         { name: "Redbridge",  code:"RED"},
//         { name: "Roding Valley",  code:"ROD"},
//         { name: "Ruislip Gardens",  code:"RUG"},
//         { name: "Shepherds Bush (Central Line)",  code:"SBC"},
//         { name: "Snaresbrook",  code:"SNB"},
//         { name: "South Ruislip",  code:"SRP"},
//         { name: "South Woodford",  code:"SWF"},
//         { name: "St Pauls",  code:"STP"},
//         { name: "Stratford",  code:"SFD"},
//         { name: "Theydon Bois",  code:"THB"},
//         { name: "Tottenham Court Road",  code:"TCR"},
//         { name: "Wanstead",  code:"WAN"},
//         { name: "West Acton",  code:"WAC"},
//         { name: "West Ruislip",  code:"WRP"},
//         { name: "White City",  code:"WCT"},
//         { name: "Woodford",  code:"WFD"}
//       ];


//       var stationsHtml = stations.map(function(station){
//         return '<option value="' + station.id + '">' +   station.name + '</option>';
//       });


//       function train(item) {
//         return '<li><div class="due-container"><span class="due">' + item.dueIn + '</span></div> <span class="destination">' + item.destination + '</span> ' + '<span class="detail"> -&nbsp;' +  item.location + '</span></li>';
//       };
//       var out = ['<div class="direction"><h3>Westbound</h3><ul class="trains">'];
//       data.Westbound.forEach(function(item) {
//         out.push(train(item));
//       })
//       out.push('</ul></div>');
//       out.push('<div class="direction"><h3>Eastbound</h3><ul  class="trains">')
//       data.Eastbound.forEach(function(item) {
//         out.push(train(item));
//       })
//       out.push('</ul></div>');

//       var ret = {};
//       ret['.widget'] = {
//         partial: 'standard',
//         data: [{
//           id: 'tflStatus',
//           h2: 'Central Line Train from Woodford',
//           '.value': out.join(' '),
//           settings: '<select>' + stationsHtml + '</select>'
//         }]
//       }
//       return ret;
//     }
//   },
 

// };
