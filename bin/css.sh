#! /bin/bash

rm -Rf ./public/css/pages/
mkdir ./public/css/pages
#rm -Rf .sass-cache


./node_modules/node-sass/bin/node-sass --source-comments ./components/shared/shared.scss ./public/css/style.css

./node_modules/node-sass/bin/node-sass --source-comments ./pages/home/home.scss ./public/css/pages/home.css
./node_modules/node-sass/bin/node-sass --source-comments ./pages/about/about.scss ./public/css/pages/about.css
./node_modules/node-sass/bin/node-sass --source-comments ./pages/station/station.scss ./public/css/pages/station.css

gulp autoprefixer

#rm components/duo.json
#DEBUG=* node_modules/duo/bin/duo -v --development --use duosass public/scss/shared.scss > public/css/shared.css
