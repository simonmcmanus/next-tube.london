// overridable
module.exports = {
  NS:'NS',
  PAGES_FOLDER: './pages/',
  JS_EXT: '.js',
  CSS_EXT: '.scss',
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
    '/:line/:station': {
        page: 'station',
        route: 'station'

    }
  }
} ;
