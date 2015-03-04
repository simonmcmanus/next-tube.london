// overridable
module.exports = {
  NS:'NT',
  PAGES_FOLDER: './pages/',
  JS_EXT: '.js',
  CSS_EXT: '.scss',
  setupPage: function(page, context) {
    window.NT.pages[page](context);
  },
  PUBLIC_FOLDER: '/pages/',
  STYLE_ID: '#perPageStyle',
  mappings: {
    '/': {
        page: 'home',
        route: 'home'
    },
    '/seach': {
        page: 'search',
        route: 'search'
    },

    '/about': {
        page: 'about',
        route: 'about'
    },
    '/:line/:stationName': {
        page: 'station',
        route: 'station'

    }
  }
} ;
