'use strict';
// see the gulp directory.

var gulp = require('gulp');
var shell = require('gulp-shell');



gulp.task('build:css', shell.task([
    './bin/css.sh'
]));

gulp.task('build:js', shell.task([
    './bin/js.sh'
]));

gulp.task('watch', function () {
    gulp.watch(['components/*/*.scss', 'public/scss/shared.scss'], ['build:css']);
    gulp.watch(['components/*/*.js', 'client/shared.js'], ['build:js']);
});
