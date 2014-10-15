module.exports = function (grunt) {
    grunt.registerTask('default', [
        'jshint',
        'concat:dist',
        'uglify',
        'clean:pre',
        'copy',
        'clean:default'
    ]);
};
