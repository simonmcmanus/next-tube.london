'use strict';
var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;


exports.get =  function() {};

// bind to certain events
exports.bind = function() {};
exports.unbind = function() {};


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

module.exports = function(stationCodes, callback) {
  async.map(stationCodes, function(stationCode, next) {

    request('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/C/' + stationCode, function(error, data) {
      parseString(data.body, function (err, result) {
        var platforms = result.ROOT.S[0].P;
        var out = {
            code: stationCode,
            name: result.ROOT.S[0].$.N,
            trains: {}
        }
        for(var platform in platforms) {
          var direction = platforms[platform].$.N.split(' - ')[0];
          var trains = sortTrains(platforms[platform].T);
          
          if(!out.trains[direction]) {
            out.trains[direction] = [];
          }
          out.trains[direction].push.apply(out.trains[direction], trains);          
        }
        //console.log('called next', out);
        next(null, out)
      });

    });
  }, function(e, d) {
    // convert to object.
    var out = {
      stationCodes: stations,
      lineCodes: lines,
      stations: {}
    };
    d.forEach(function(item) {
      out.stations[item.code] = item;
    });
    callback( e, out);
  });
};


var lines = {
  B: "Bakerloo",
  C: "Central",
  D: "District",
  H: "Hammersmith & Circle",
  J: "Jubilee",
  M: "Metropolitan",
  N: "Northern",
  P: "Piccadilly",
  V: "Victoria",
  W: "Waterloo & City"
};


var stations = {
  BNK : "Bank",
  BDE : "Barkingside",
  BNG : "Bethnal Green",
  BDS : "Bond Street",
  BHL : "Buckhurst Hill",
  CYL : "Chancery Lane",
  CHG : "Chigwell",
  DEB : "Debden",
  EBY : "Ealing Broadway",
  EAC : "East Acton",
  EPP : "Epping",
  FLP : "Fairlop",
  GHL : "Gants Hill",
  GRH : "Grange Hill",
  GFD : "Greenford",
  HAI : "Hainault",
  HLN : "Hanger Lane", 
  HOL : "Holborn", 
  HPK : "Holland Park", 
  LAN : "Lancaster Gate", 
  LEY : "Leyton", 
  LYS : "Leytonstone", 
  LST : "Liverpool Street", 
  LTN : "Loughton", 
  MAR : "Marble Arch", 
  MLE : "Mile End" ,
  NEP : "Newbury Park", 
  NAC : "North Acton", 
  NHT : "Northolt", 
  NHG : "Notting Hill Gate", 
  OXC : "Oxford Circus", 
  PER : "Perivale", 
  QWY : "Queensway", 
  RED : "Redbridge", 
  ROD : "Roding Valley", 
  RUG : "Ruislip Gardens", 
  SBC : "Shepherds Bush (Central Line)", 
  SNB : "Snaresbrook", 
  SRP : "South Ruislip", 
  SWF : "South Woodford", 
  STP : "St Pauls", 
  SFD : "Stratford", 
  THB : "Theydon Bois", 
  TCR : "Tottenham Court Road", 
  WAN : "Wanstead", 
  WAC : "West Acton", 
  WRP : "West Ruislip", 
  WCT : "White City", 
  WFD : "Woodford"
};
