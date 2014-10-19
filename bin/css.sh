#! /bin/bash

rm -Rf ./public/css
echo ./public/css deleted
mkdir ./public/css

rm components/duo.json

node_modules/duo/bin/duo -v --development --use duosass public/scss/shared.scss > public/css/shared.css
