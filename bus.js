'use strict';

var request = require('request');

request('http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?ReturnList=stopId&LineName=275&Circle=51.6067182,0.03675780000003215,5000', function(e, r, d)  {
        var out = [];
        var a = d.split('\r\n');
        var c = a.length;
        var stops = {};
        var vehicles = {};
        while(c--) {
          var bus = JSON.parse(a[c]);
          var b = {
            stopId:'',
            ReturnType:'',
            StopPointState:'',
            lat:'',
            long:'',
            reg:'',
            direction:'',
            VehicleID:''
          };

          if(bus[0] === 1 && bus[1] !==2 &&  bus[1] !== 3) {

            console.log('past', bus);


            if(!stops[b.stopId]){
              stops[b.stopId] = b;
            }


          }

          console.log(a[c]);
      }
});
