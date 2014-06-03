'use strict';

var parseString = require('xml2js').parseString;
var request = require('request');

module.exports = function(callback) {

  function sortTrains(trains) {
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
      };
    });
  };

  request('http://cloud.tfl.gov.uk/TrackerNet/PredictionDetailed/C/WFD', function(error, data) {

    parseString(data.body, function (err, result) {

      var platforms = result.ROOT.S[0].P;
      var out = {
        'Westbound': [],
        'Eastbound': [],
        stations: [
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
      ]
      };
      for(var platform in platforms) {
        var direction = platforms[platform].$.N.slice(0, 9);
        var trains = sortTrains(platforms[platform].T);
        out[direction].push.apply(out[direction], trains);
      }
      callback(null, out);
    });

  });
};
