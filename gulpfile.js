'use strict';
// see the gulp directory.

var gulp = require('gulp');
var shell = require('gulp-shell');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('build:css', shell.task([
    './bin/css.sh'
]));

gulp.task('build:js', shell.task([
    './bin/js.sh'
]));

gulp.task('build', shell.task([
    './bin/js.sh',
    './bin/css.sh'
]));


gulp.task('autoprefixer', function () {
    return gulp.src('./public/css/shared.css')
        .pipe(autoprefixer())
        .pipe(gulp.dest('./public/css/'));
});


gulp.task('watch', function () {
    gulp.watch(['components/**/*.scss', 'pages/**/*.scss'], ['build:css', 'autoprefixer']);
    gulp.watch(['components/**/*.js', 'components/**/*.jade', 'views/**', 'pages/**.js'], ['build:js']);
});
