#! /bin/bash

rm -Rf ./public/css
echo ./public/css deleted
mkdir ./public/css

rm components/duo.json

node_modules/duo/bin/duo --use duosass public/scss/shared.scss > public/css/shared.css
