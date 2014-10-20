#! /bin/bash

rm -Rf ./public/css
mkdir ./public/css
#rm -Rf .sass-cache


scss --sourcemap=inline client/shared.scss:public/css/shared.css

#rm components/duo.json
#DEBUG=* node_modules/duo/bin/duo -v --development --use duosass public/scss/shared.scss > public/css/shared.css
