#! /bin/bash

rm -Rf ./public/pages/js/
mkdir ./public/pages/js/ -p
#rm components/duo.json
#rmdir ./public/pages/js/pages/
#
browserify   ./pages/shared/shared.js > ./public/pages/js/shared.js
browserify   ./pages/home/home.js > ./public/pages/js/home.js
browserify   ./pages/about/about.js > ./public/pages/js/about.js
browserify   ./pages/station/station.js > ./public/pages/js/station.js

#gulp compressjs
#node_modules/duo/bin/duo -v --development --use duo-jade ./pages/shared/shared.js ./public/pages/js  
#mv ./public/pages/js/pages/* ./public/pages/js
#rmdir ./public/pages/js/pages/


