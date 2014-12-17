#! /bin/bash

rm -Rf ./public/js
mkdir ./public/js

browserify  client/shared.js --transform react-jade > public/js/shared.js
