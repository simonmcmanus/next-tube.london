var request  = require('request');
var cheerio = require('cheerio');

request('http://www.bbc.co.uk/weather/ig8', function(e, d) {
  var $ = cheerio.load(d.body);


  console.log($('.hourly').html());

})
