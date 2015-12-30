/*
 * grunt-clientlibify
 * https://github.com/mickleroy/grunt-clientlibify
 *
 * Copyright (c) 2015 Michael Leroy
 * Licensed under the MIT license.
 */

// TODO: install package via:
// POST admin:admin -F package=@<package.zip> http://localhost:4502/crx/packmgr/service.json?cmd=upload
// Content-Type: multipart/form-data
// TODO: work on supporting other folders outside css and js

'use strict';

var fs = require('fs');
var archiver = require('archiver');

module.exports = function (grunt) {

  var templates = {
    designContent:    'tasks/templates/designContent.xml',
    clientlibContent: 'tasks/templates/clientlibContent.xml',
    filterXml:        'tasks/templates/filter.xml',
    folderContent:    'tasks/templates/folderContent.xml',
    jcrRootContent:   'tasks/templates/jcrRootContent.xml',
    propertiesXml:    'tasks/templates/properties.xml'
  }
  //var clientlibPathInPackage = '<%= category %>-<%= version %>/jcr_root/etc/designs/';

  grunt.registerMultiTask('clientlibify', 'Integrate AEM with a styleguide', function () {

    var options = this.options({
      dest: 'tmp',
      category: 'etc-clientlibify',
      embed: [],
      dependencies: [],
      package: {
        name: 'clientlibify',
        version: '1.0',
        group: 'my_packages',
        description: 'Clientlib package installed from grunt-clientlibify plugin'
      },

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
    var clientlibRootDir        = options.dest + '/jcr_root/etc/designs/' + options.category;
    var clientlibFolderLocation = clientlibRootDir + '/clientlibs';
    var metaInfDirLocation      = options.dest + '/META-INF/vault';

    grunt.file.mkdir(clientlibRootDir);

    // create .content.xml for `/jcr_root/` folder
    grunt.file.copy(templates.jcrRootContent, options.dest + '/jcr_root/' + '/.content.xml');

    // create .content.xml for `/jcr_root/etc/` folder
    grunt.file.copy(templates.folderContent, options.dest + '/jcr_root/etc' + '/.content.xml');

    // create .content.xml for `/jcr_root/etc/designs` folder
    grunt.file.copy(templates.folderContent, options.dest + '/jcr_root/etc/designs' + '/.content.xml');

    // create .content.xml for `/jcr_root/etc/designs/<category>/` folder
    var designFileContents = grunt.template.process(grunt.file.read(templates.designContent), {data: options});
    grunt.file.write(clientlibRootDir + '/.content.xml', designFileContents);

    // create .content.xml for `/jcr_root/etc/designs/<category>/clientlibs` folder
    var clientLibFileContents = grunt.template.process(grunt.file.read(templates.clientlibContent), {data: options});
    grunt.file.write(clientlibFolderLocation + '/.content.xml', clientLibFileContents);

    // create css directory
    if (options.cssDir) {
      generateClientLibrarySection('css', options.cssDir, ['*.css', '*.less']);
    }

    // create js directory
    if (options.jsDir) {
      generateClientLibrarySection('js', options.jsDir, ['*.js']);
    }

    // create META-INF folder
    grunt.file.mkdir(metaInfDirLocation);

    // create `META-INF/vault/filter.xml` file
    var filterFileContents = grunt.template.process(grunt.file.read(templates.filterXml), {data: options});
    grunt.file.write(metaInfDirLocation + '/filter.xml', filterFileContents);

    // create `META-INF/vault/properties.xml` file
    var propsFileContents = grunt.template.process(grunt.file.read(templates.propertiesXml), {data: options});
    grunt.file.write(metaInfDirLocation + '/properties.xml', propsFileContents);

    // zip up the clientlib
    zipDirectory(options.dest, options.dest,
                options.category + '-' + options.package.version + '.zip');

    // clean up after ourselves
    //cleanup();

    /*****************************
     *    UTILITY FUNCTIONS      *
     *****************************/

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

    function zipDirectory(pathToDirectory, destination, zipFileName) {
      var writeStream = fs.createWriteStream(destination + '/' + zipFileName);
      var archive = archiver('zip', {});
      archive.pipe(writeStream);
      archive.directory(pathToDirectory + '/jcr_root', destination);
      archive.directory(pathToDirectory + '/META-INF', destination);
      archive.finalize();
    }

    function cleanup() {
      grunt.file.delete(clientlibRootDir);
    }
  });
};
