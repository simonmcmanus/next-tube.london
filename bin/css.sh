#! /bin/bash

rm -Rf ./public/pages/css/
mkdir ./public/pages/css/
#rm -Rf .sass-cache


./node_modules/node-sass/bin/node-sass  ./pages/shared/shared.scss ./public/pages/css/style.css
./node_modules/node-sass/bin/node-sass  ./pages/home/home.scss ./public/pages/css/home.css
./node_modules/node-sass/bin/node-sass  ./pages/about/about.scss ./public/pages/css/about.css
./node_modules/node-sass/bin/node-sass  ./pages/station/station.scss ./public/pages/css/station.css


gulp autoprefixer

#rm components/duo.json
#DEBUG=* node_modules/duo/bin/duo -v --development --use duosass public/scss/shared.scss > public/css/shared.css
