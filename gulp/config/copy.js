'use strict';

var gulp = require('gulp');

gulp.task('copy-dts', function () {
    return gulp.src('src/tri-angular-dialog.d.ts').pipe(gulp.dest('dist/'));
});