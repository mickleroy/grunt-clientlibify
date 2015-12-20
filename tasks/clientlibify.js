/*
 * grunt-clientlibify
 * https://github.com/mickleroy/grunt-clientlibify
 *
 * Copyright (c) 2015 Michael Leroy
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var archiver = require('archiver');

module.exports = function (grunt) {

  var DESIGN_CONTENT_TEMPLATE     = 'tasks/templates/designContent.xml';
  var CLIENTLIB_CONTENT_TEMPLATE  = 'tasks/templates/clientlibContent.xml';


  grunt.registerMultiTask('clientlibify', 'Integrate AEM with a styleguide', function () {

    var options = this.options({
      dest: 'tmp',
      category: 'etc-clientlibify',
      embed: [],
      dependencies: ['jquery', 'handlebars']
    });

    // validate mandatory config
    if (options.cssDir && !grunt.file.isDir(options.cssDir)) {
      grunt.log.error(options.cssDir + ' is not a directory');
      return false;
    }

    if (options.jsDir && !grunt.file.isDir(options.jsDir)) {
      grunt.log.error(options.jsDir + ' is not a directory');
      return false;
    }

    // create design folder
    var designFolderLocation    = options.dest + '/' + options.category;
    var clientlibFolderLocation = designFolderLocation + '/clientlibs';

    grunt.file.mkdir(designFolderLocation);

    // create .content.xml for design folder
    var designFileContents = grunt.template.process(grunt.file.read(DESIGN_CONTENT_TEMPLATE), {data: options});
    grunt.file.write(designFolderLocation + '/.content.xml', designFileContents);

    // create .content.xml for clientlib folder
    var clientLibFileContents = grunt.template.process(grunt.file.read(CLIENTLIB_CONTENT_TEMPLATE), {data: options});
    grunt.file.write(clientlibFolderLocation + '/.content.xml', clientLibFileContents);

    // create css directory
    if (options.cssDir) {
      generateClientLibrarySection('css', options.cssDir, ['*.css', '*.less']);
    }

    // create js directory
    if (options.jsDir) {
      generateClientLibrarySection('js', options.jsDir, ['*.js']);
    }

    // zip up the clientlib
    var writeStream = fs.createWriteStream(options.dest + '/' + options.category + '.zip');
    var archive = archiver('zip', {});
    archive.pipe(writeStream);
    archive.directory(clientlibFolderLocation, options.dest);
    archive.finalize();

    // clean up after ourselves
    cleanup();

    function generateClientLibrarySection(name, pathToSrcDirectory, fileExtensions) {
      grunt.file.mkdir(clientlibFolderLocation + '/' + name);

      // write .txt file
      var files = grunt.file.expand({filter: 'isFile', cwd: pathToSrcDirectory}, fileExtensions);
      grunt.file.write(clientlibFolderLocation + '/' + name + '.txt',
                      "#base=".concat(name).concat('\n')
                      .concat(files.join('\n')));

      // copy files over to client library
      grunt.file.recurse(pathToSrcDirectory, function (abspath, rootdir, subdir, filename) {
        grunt.file.copy(abspath, clientlibFolderLocation + '/' + name + '/' + filename);
      });
    }

    function cleanup() {
      grunt.file.delete(designFolderLocation);
    }
  });
};
