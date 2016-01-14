'use strict';
module.exports = function(grunt) {
    return {
        css: ['<%= paths.dist %>/styles/**/*.css', '<%= paths.app %>/styles/critical/*.css'],
        js: ['<%= paths.dist %>/scripts/**/*.js'],
        options: {
            assetsDirs: ['<%= paths.dist %>']
        }
    };
};
