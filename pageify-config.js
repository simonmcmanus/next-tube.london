// overridable
module.exports = {
  PAGES_FOLDER: './pages/',
  PUBLIC_FOLDER: '/pages/',
  JS_EXT: '.js',
  CSS_EXT: '.scss',
  setupPage: function(page, context) {
      new window.NT.pages[page](context);
  },
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
