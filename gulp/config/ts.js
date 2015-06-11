'use strict';

var gulp = require('gulp');

var concat = require('gulp-concat');
var dereserve = require('gulp-dereserve');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var uglify = require('gulp-uglify');
var rules = require('./tslint.json');

var tsConfig = {
    declarationFiles: false,
    noExternalResolve: true,
    sortOutput: true,
    target: 'ES5',
    typescript: require('typescript')
};

var tsPreBuild = function (dest) {
    return gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts(tsConfig)).js
        .pipe(dereserve())
        .pipe(concat(dest));
};

var tsPostBuild = function (preBuild) {
    return preBuild
        .pipe(sourcemaps.write('../dist'))
        .pipe(gulp.dest('dist/'));
};

gulp.task('ts-build', function () {
    return tsPostBuild(tsPreBuild('tri-angular-dialog.js'));
});

gulp.task('ts-build-min', function () {
    return tsPostBuild(tsPreBuild('tri-angular-dialog.min.js').pipe(uglify()));
});

gulp.task('ts-lint', function () {
    return gulp.src('src/module/**/*.ts')
        .pipe(tslint({configuration: {rules: rules}}))
        .pipe(tslint.report('verbose'));
});
