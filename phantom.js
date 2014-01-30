var page = require('webpage').create();
var url = 'http://www.bbc.co.uk/weather/ig8';
page.open(url, function () {
    console.log(page.content);
    phantom.exit();
});

// var page = require('webpage').create();


// page.onConsoleMessage = function (msg) {
//     console.log('Page title is ' + msg);
// };


// page.open(url, function (status) {
//   var html = page.evaluate(function () {
//     return document.documentElement.outerHTML;
//   });
//   console.log(html);
// });

//  var cheerio = require('cheerio');


// var phantom = require('phantom');
//  phantom.create(function(ph) {
//    ph.createPage(function(page) {
//      page.open('http://www.bbc.co.uk/weather/ig8', function(status) {
//       console.log(page.content);
// //        console.log("opened google? ", status);
// //        page.evaluate((function() {
// //                 var $ = cheerio.load(document.documentElement.outerHTML);

// //          console.log('markup is:' + $('.hourly').html());

// // //         return document.documentElement.outerHTML;
// //        }), function(result) {
// //          ph.exit();
// //        });
//      });
//    });
//  });
