/**
 * Copy
 */
module.exports = function(grunt) {

    grunt.config.set('copy', {
        main: {
            files: [
                {src: ['tmp/tri-angular-dialog.js'], dest: 'dist/tri-angular-dialog.js'},
                {src: ['tmp/tri-angular-dialog.min.js'], dest: 'dist/tri-angular-dialog.min.js'},
                {src: ['tmp/tri-angular-dialog.min.js.map'], dest: 'dist/tri-angular-dialog.min.js.map'},
                {src: ['tmp/tri-angular-dialog.js'], dest: 'demo/vendor/tri-angular/tri-angular-dialog.js'}
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
};
