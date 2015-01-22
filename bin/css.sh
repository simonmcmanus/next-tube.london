#! /bin/bash

rm -Rf ./public/pages/css/
mkdir ./public/pages/css/
#rm -Rf .sass-cache


scss --sourcemap=inline ./pages/shared/shared.scss public/pages/css/style.css


gulp autoprefixer

#rm components/duo.json
#DEBUG=* node_modules/duo/bin/duo -v --development --use duosass public/scss/shared.scss > public/css/shared.css
