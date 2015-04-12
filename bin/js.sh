#! /bin/bash

rm -Rf ./public/js/pages
rm ./public/js/shared.js

mkdir ./public/js/pages/ -p

browserify ./pages/about/about.js ./pages/home/home.js ./pages/station/station.js -p [ factor-bundle -o ./public/js/pages/about.js -o ./public/js/pages/home.js -o ./public/js/pages/station.js  ] -o public/js/shared.js
