'use strict';
// see the gulp directory.

var gulp = require('gulp');
var shell = require('gulp-shell');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');

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
    return gulp.src('./public/pages/css/style.css')
        .pipe(autoprefixer())
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(gulp.dest('./public/pages/css/'));
});

gulp.task('compressjs', function() {
  gulp.src('./public/pages/js/shared.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/pages/js'))
});


gulp.task('watch', function () {
    gulp.watch(['components/**/*.scss', 'pages/**/*.scss'], ['build:css']);
    gulp.watch(['components/**/*.js', 'components/**/*.jade', 'views/**', 'pages/*/*.js'], ['build:js']);
});
