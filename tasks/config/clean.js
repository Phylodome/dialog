/**
 * Clean
 */
module.exports = function(grunt) {

    grunt.config.set('clean', {
        default: ['tmp/'],
        pre: ['dist/']
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
};
