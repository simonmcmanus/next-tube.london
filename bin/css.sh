#! /bin/bash

rm -Rf ./public/pages/station/
mkdir ./public/pages/station/
#rm -Rf .sass-cache


scss --sourcemap=inline pages/station/station.scss:public/pages/station/style.css

#rm components/duo.json
#DEBUG=* node_modules/duo/bin/duo -v --development --use duosass public/scss/shared.scss > public/css/shared.css
