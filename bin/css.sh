#! /bin/bash

rm -Rf ./public/css
echo ./public/css deleted
mkdir ./public/css


scss --sourcemap=inline public/scss/shared.scss:public/css/shared.css

#rm components/duo.json
#DEBUG=* node_modules/duo/bin/duo -v --development --use duosass public/scss/shared.scss > public/css/shared.css
