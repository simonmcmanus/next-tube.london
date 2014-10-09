
var request = require('request');

var Norey = "Thomas";
var Benny = "Benny";




var matrix = {
  Norey: Norey,
  Benny: Benny
}

module.exports = function(callback) {




// end of road towards walthamstow.
//request('http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?stopCode1=74662,49453&returnList=EstimatedTime', function(e, r, d) {
request('http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?stopCode1=74662,49453&returnList=EstimatedTime,DirectionID,Towards', function(e, r, d) {
  var out = {};
  var a = d.split('\r\n');
  var c = a.length;
  while(c--) {
    // if(c==0){
    //   break;
    // }



    var now = +new Date();
    var bus = JSON.parse(a[c]);
    var howLong = bus[3] - now;

    var directionId = bus[2];
    
    if(!out[directionId]) {
      out[directionId] = {
        direction: bus[1],
        buses: []
      }
    }
    

    var minutes = (howLong / 1000) / 60;
    var minsStr = ''+minutes;
    var minsArr = minsStr.split('.');
    if(minsArr[1]) {
      out[directionId].buses.push({
        to: bus[1],
        due: minsArr[0]
      });

    }

  }
  callback(null, out);
});



Norey

//console.log("Hello ", matrix.Norey)
}; 

  // nextBus: {
  //   data: function(callback) {
  //     //http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?stopCode1=75120&returnList=EstimatedTime,longitude,latitude,StopPointName
  //     //http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?ReturnList=StopPointName,StopID,Towards,StopPointIndicator,StopPointState,Latitude,Longitude,VisitNumber,LineID,LineName,DirectionID,DestinationName,VehicleID,TripID,RegistrationNumber,EstimatedTime,ExpireTime&LineName=275&Circle=51.6067182,0.03675780000003215,5000
  //     //http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?ReturnList=EstimatedTime,Longitude,Latitude,StopPointName,RegistrationNumber,DirectionID,Towards,StopCode1,StopCode2,StopPointType,Bearing&LineName=275
  //     //
  //     //
  //     request('http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?ReturnList=StopPointName,StopID,Towards,StopPointIndicator,StopPointState,Latitude,Longitude,VisitNumber,LineID,LineName,DirectionID,DestinationName,VehicleID,TripID,RegistrationNumber,EstimatedTime,ExpireTime&LineName=275', function(e, r, d) {
        
  //       var out = [];
  //       var a = d.split('\r\n');
  //       var c = a.length;
  //       while(c--) {
  //         var bus = JSON.parse(a[c]);
  //         out.push({
  //           currentLocation: bus[2],
  //           lat: bus[6],
  //           long: bus[7],
  //           registration: bus[6],
  //           bearing: bus[6],

  //           due: new Date(bus[7]),
  //         });
  //       }
  //       callback(null, out.reverse());

  //     });
  //   },
  //   selectors: function(data) {

  //     var list = data.map(function(bus) {
  //       return '<li>' + moment(bus).fromNow() + '</li>';
  //     })

  //     return {
  //       '.widget': {
  //           partial: 'map',
  //           data: [{
  //             id: 'nextBus',
  //             h2: '275 Bus',
  //             '.value': '<li>' + list.join('') + '</li>'
  //           }
  //           ]
  //       }
  //     }

  //   }
  // },