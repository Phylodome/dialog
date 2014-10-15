/**
 * Uglify
 */
module.exports = function(grunt) {

    grunt.config.set('uglify', {
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
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
};
