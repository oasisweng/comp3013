module.exports = function (grunt, options) {
    var _ = require('lodash');
    var fs = require('fs-extra');
    var path = require('path');
    var slash = require('slash');
    var php = require('php-proxy-middleware');
    var getPort = require('get-port');
    

    // helper
    function getMiddleware(target) {
        if (target === 'dist') {
            process.env['SYMFONY_ENV'] = 'prod';
            process.env['SYMFONY_DEBUG'] = 0;
        } else {
            process.env['SYMFONY_ENV'] = 'node';
            process.env['SYMFONY_DEBUG'] = 1;
        }
        return php({
            address: '127.0.0.1', // which interface to bind to
            ini: {max_execution_time: 60, variables_order: 'EGPCS'},
            root: options.paths.dist,
            router: path.join(options.paths.dist, 'app.php')
        });
    }

    return {
        default: [
            'availabletasks'
        ],
        css: [
            'clean:css',
            'sass',
            'autoprefixer',
            'fetch',
            'uncss',
            'cssmin',
            'critical'
        ],
        js: [
            'clean:js', 
            'webpack'
        ],
        img: [
            'clean:img',
            'imagemin',
            'svgmin'
        ],
        rev: [
            'filerev',
            'revdump',
            'usemin'
        ],
        'generate-service-worker': [
            'copy:sw-scripts',
            'sw-precache:dist'
        ],
        assets: [
            'test',
            'js',
            'css',
            'img',
            'rev',
            'copy:dist',
            'clean:tmp',
            'generate-service-worker'
        ],
        build: [
            'assets',
            'exec:sfcl'
        ],
        test: [
            'eslint','karma','phpunit'
        ],
        fetch: function(){
            var done = this.async();

            getPort().then(function(port){
                grunt.connectMiddleware = getMiddleware();
                grunt.config.set('connect.fetch.options.port', port);
                grunt.task.run(['connect', 'http']);
                done();
            });
        },
        revdump: function(){
            var file = 'app/config/filerev.json';
            fs.outputJsonSync(file, _.reduce(grunt.filerev.summary, function(acc,val,key){
                acc[slash(key.replace('web',''))] = slash(val.replace('web',''));
                return acc;
            },{}));
        },
        serve: function(target) {
            // clean tmp
            grunt.task.run(['clean:tmp']);

            if (target === 'dist') {
                grunt.task.run(['build']);
            } else {
                target = 'dev';
                grunt.task.run(['sass','autoprefixer']);
            }

            // start php middleware
            grunt.bsMiddleware = getMiddleware(target);

            grunt.task.run([
                'browserSync:'+ target, // Using the php middleware
                'watch'                 // Any other watch tasks you want to run
            ]);
        }
    };
};
