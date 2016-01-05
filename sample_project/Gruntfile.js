module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clientlibify: {
      options: {
        dest: 'dist',
        cssDir: 'assets/styles',
        jsDir: 'assets/scripts',

        // set `installPackage` to `true` to deploy to an AEM instance
        installPackage: false,

        categories: ['awesome-styleguide'],
        embed: [],
        dependencies: ['cq-jquery'],

        // package options
        packageName: 'prickly-pear',
        packageVersion: '2.1',
        packageGroup: 'My Company',
        packageDescription: 'CRX package installed using the grunt-clientlibify plugin',

        // deploy options
        // Note: these options would likely come from environment vars
        deployScheme: 'http',
        deployHost: 'localhost',
        deployPort: '4502',
        deployUsername: 'admin',
        deployPassword: 'admin'
      },
      build: {
        // target options go here
      }
    }
  });

  // Load the plugin that provides the "clientlibify" task.
  grunt.loadNpmTasks('grunt-clientlibify');

  // Default task(s).
  grunt.registerTask('default', ['clientlibify']);

};