#! /bin/bash

rm -Rf ./public/pages/js/
mkdir ./public/pages/js/

#rm components/duo.json

node_modules/duo/bin/duo -v --development ./pages/**/*.js  ./public/pages/js --use duo-jade
mv ./public/pages/js/pages/* ./public/pages/js/
rmdir ./public/pages/js/pages/