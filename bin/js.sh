#! /bin/bash

rm -Rf ./public/pages/js/
mkdir ./public/pages/js/

#rm components/duo.json

node_modules/duo/bin/duo -v --development --use duo-jade pages/station/station.js > public/pages/js/interations.js
