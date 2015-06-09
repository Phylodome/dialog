'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('bower', function (done) {
    runSequence('bower-get', 'bower-copy', done);
});

