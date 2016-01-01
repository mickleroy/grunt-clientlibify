/*
 * grunt-clientlibify
 * https://github.com/mickleroy/grunt-clientlibify
 *
 * Copyright (c) 2015 Michael Leroy
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    clientlibify: {
      // Default options
      default_options: {
        options: {
            cssDir: 'test/fixtures/css',
            jsDir: 'test/fixtures/js'
        }
      },
      // Custom package options
      custom_package_options: {
        options: {
          cssDir: 'test/fixtures/css',
          jsDir: 'test/fixtures/js',
          category: 'styleguide',
          embed: [],
          dependencies: [],
          package: {
            name: 'aem-styleguide',
            version: '2.1',
            group: 'My Company',
            description: 'This package contains our mighty styleguide!'
          }
        }
      },
      // Generate a CSS only clientlib
      css_only_options: {
        options: {
          cssDir: 'test/fixtures/css',
          package: {
            name: 'css-styleguide',
            version: '1.0',
            group: 'my_packages',
            description: ''
          }
        }
      },
      // Generate a JS only clientlib
      js_only_options: {
        options: {
          jsDir: 'test/fixtures/js',
          package: {
            name: 'js-styleguide',
            version: '1.0',
            group: 'my_packages',
            description: ''
          }
        }
      },
      // Deploys the CRX package to an local AEM instance
      deploy_options: {
        options: {
          installPackage: true,
          package: {
            name: 'deploy-clientlibify',
            version: '1.0',
            group: 'my_packages',
            description: 'CRX package installed from grunt-clientlibify plugin'
          },
          deploy: {
            scheme: 'http',
            host: 'localhost',
            port: '4502',
            username: 'admin',
            password: 'admin'
          }
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'clientlibify', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
