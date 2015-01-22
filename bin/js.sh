#! /bin/bash

rm -Rf ./public/pages/js/
mkdir ./public/pages/js/

#rm components/duo.json
#rmdir ./public/pages/js/pages/
browserify -t jadeify ./pages/shared/shared.js > ./public/pages/js/shared.js

#gulp compressjs
#node_modules/duo/bin/duo -v --development --use duo-jade ./pages/shared/shared.js ./public/pages/js  
#mv ./public/pages/js/pages/* ./public/pages/js
#rmdir ./public/pages/js/pages/



