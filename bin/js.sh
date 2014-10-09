#! /bin/bash


rm -Rf ./public/js
mkdir ./public/js

rm components/duo.json
rm public/js/shared.js

node_modules/duo/bin/duo -v --development --use duo-jade client/shared.js > public/js/shared.js
