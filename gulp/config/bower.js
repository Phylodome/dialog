'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');

gulp.task('bower-get', function () {
    return bower();
});

gulp.task('bower-copy', function () {
    return gulp.src(mainBowerFiles({includeDev: true}), {
        base: 'bower_components'
    }).pipe(gulp.dest('demo/vendor/'));
});