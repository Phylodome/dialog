/**
 * JSHint
 */
module.exports = function(grunt) {

    grunt.config.set('concat', {
        dist: {
            options: {
                banner: '/*!\n * triAngular Dialog\n */\n\n(function (mod) {\n\'use strict\';\n\n',
                separator:'\n\n',
                footer: '\n\n})(angular.module(\'triNgDialog\', [\'ng\', \'ngAnimate\']));',
                process: function(src, filepath) {
                    return '// Source: ' + filepath + '\n' +
                        src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                }
            },
            files: {
                'tmp/tri-angular-dialog.js': [
                    'src/directives/*.js',
                    'src/services/*.js'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
};
