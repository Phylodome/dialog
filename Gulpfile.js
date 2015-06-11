'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');

requireDir('./gulp/config/');
requireDir('./gulp/register/');


gulp.task('prepare', function (done) {
    runSequence(
        'clean',
        'bower',
        'ts',
        'copy-dts',
        done
    );
});

gulp.task('default', function (done) {
    runSequence('ts', 'copy-dts', done);
});