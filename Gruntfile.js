module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-bower-task');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        bower: {
            install: {
                options: {
                    targetDir: 'demo/vendor',
                    verbose: true,
                    cleanTargetDir: true,
                    cleanBowerDir: true
                }
            }
        },

        jshint: {
            options: {
                "camelcase": true,
                "curly": true,
                "expr": true,
                "eqeqeq": false,
                "freeze": true,
                "globalstrict": true,
                "globals": {
                    "angular": false,
                    "window": false,
                    "document": false,
                    "mod": false
                },
                "immed": true,
                "indent": 4,
                "latedef": true,
                "maxdepth": 2,
                "maxstatements": 12,
                "maxcomplexity": 5,
                "noarg": true,
                "noempty": true,
                "nonew": true,
                "quotmark": true,
                "strict": true,
                "trailing": true,
                "undef": true,
                "unused": true,
                "white": true
            },
            default: [
                'src/**/*.js'
            ]
        },

        concat: {
            dist: {
                options: {
                    banner: '/*!\n * triAngular Dialog\n */\n\n(function (mod) {\n\'use strict\';\n\n',
                    separator:'\n\n',
                    footer: '\n\n})(angular.module(\'triNgDialog\', []));',
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
        },

        uglify: {
            options: {
                report: 'min',
                sourceMap: true,
                sourceMapName: 'tmp/tri-angular-dialog.min.js.map',
                preserveComments: 'some'
            },
            my_target: {
                files: {
                    'tmp/tri-angular-dialog.min.js': ['tmp/tri-angular-dialog.js']
                }
            }
        },

        copy: {
            main: {
                files: [
                    {src: ['tmp/tri-angular-dialog.js'], dest: 'dist/tri-angular-dialog.js'},
                    {src: ['tmp/tri-angular-dialog.min.js'], dest: 'dist/tri-angular-dialog.min.js'},
                    {src: ['tmp/tri-angular-dialog.min.js.map'], dest: 'dist/tri-angular-dialog.min.js.map'},
                    {src: ['tmp/tri-angular-dialog.js'], dest: 'demo/vendor/tri-angular/tri-angular-dialog.js'}
                ]
            }
        },

        clean: {
            'default': ['tmp/'],
            'pre': ['dist/']
        }

    });

    grunt.registerTask('default', [
        'jshint',
        'concat:dist',
        'uglify',
        'clean:pre',
        'copy',
        'clean:default'
    ]);

    grunt.registerTask('set-dev', [
        'bower',
        'default'
    ]);

};
