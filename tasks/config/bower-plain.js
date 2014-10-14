/**
 * Install bower dependencies
 */
module.exports = function(grunt) {
    var bower = require('bower');
    grunt.registerTask('bower-plain', 'Pre-load bower dependencies', function () {

        var done = this.async();
        var cfg = grunt.file.readJSON('bower.json');
        var key;
        var depsArray = [];

        if (cfg.dependencies)
            for (key in cfg.dependencies)
                if (cfg.dependencies.hasOwnProperty(key))
                    depsArray.push(key + '#' + cfg.dependencies[key]);

        if (cfg.devDependencies)
            for (key in cfg.devDependencies)
                if (cfg.devDependencies.hasOwnProperty(key))
                    depsArray.push(key + '#' + cfg.devDependencies[key]);

        depsArray.length && bower.commands
            .install(depsArray, {save: false}, {})
            .on('end', function () {
                grunt.log.writeln(' ');
                grunt.log.writeln('    Installed:');
                grunt.log.writeln(' ');
                depsArray.forEach(function (item) {
                    grunt.log.writeln('    ' + item);
                });
                grunt.log.writeln(' ');
                done();
            });
    });
};