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
var path = require('path');
var chalk = require('chalk');
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
        description: 'CRX package installed from grunt-clientlibify plugin'
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

    var jcrRootPath = path.join(options.dest, '/jcr_root');
    var metaInfPath = path.join(options.dest, '/META-INF');

    var clientlibRootDir        = path.join(jcrRootPath, '/etc/designs/', options.category);
    var clientlibFolderLocation = path.join(clientlibRootDir, '/clientlibs');
    var vaultPath      = path.join(metaInfPath, '/vault');

    grunt.file.mkdir(clientlibRootDir);

    // create .content.xml for `/jcr_root/` folder
    grunt.file.copy(templates.jcrRootContent, path.join(jcrRootPath, '/.content.xml'));

    // create .content.xml for `/jcr_root/etc/` folder
    grunt.file.copy(templates.folderContent, path.join(jcrRootPath, '/etc/.content.xml'));

    // create .content.xml for `/jcr_root/etc/designs` folder
    grunt.file.copy(templates.folderContent, path.join(jcrRootPath, '/etc/designs/.content.xml'));

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
    grunt.file.mkdir(vaultPath);

    // create `META-INF/vault/filter.xml` file
    var filterFileContents = grunt.template.process(grunt.file.read(templates.filterXml), {data: options});
    grunt.file.write(path.join(vaultPath, '/filter.xml'), filterFileContents);

    // create `META-INF/vault/properties.xml` file
    var propsFileContents = grunt.template.process(grunt.file.read(templates.propertiesXml), {data: options});
    grunt.file.write(path.join(vaultPath, '/properties.xml'), propsFileContents);

    // zip up the clientlib
    var directoriesToZip = [
      {src: jcrRootPath, dest: '/jcr_root'},
      {src: metaInfPath, dest: '/META-INF'}
    ];
    var zipFileLocation = path.join(options.dest, options.category + '-' + options.package.version + '.zip');

    zipDirectory(directoriesToZip, zipFileLocation, this.async(), function() {
      // clean up after ourselves
      cleanup();
    });


    /*****************************
     *    UTILITY FUNCTIONS      *
     *****************************/

    function generateClientLibrarySection(name, pathToSrcDirectory, fileExtensions) {
      grunt.file.mkdir(path.join(clientlibFolderLocation, name));

      // write .txt file
      var files = grunt.file.expand({filter: 'isFile', cwd: pathToSrcDirectory}, fileExtensions);
      grunt.file.write(path.join(clientlibFolderLocation, name + '.txt'),
                      "#base=".concat(name).concat('\n')
                      .concat(files.join('\n')));

      // copy files over to client library
      grunt.file.recurse(pathToSrcDirectory, function (abspath, rootdir, subdir, filename) {
        grunt.file.copy(abspath, path.join(clientlibFolderLocation, name, filename));
      });
    }

    function zipDirectory(files, dest, done, callback) {
      var archive = archiver.create('zip', {gzip: false});

      // ensure dest folder exists
      grunt.file.mkdir(path.dirname(dest));

      // Where to write the file
      var destStream = fs.createWriteStream(dest);

      archive.on('error', function(err) {
        grunt.log.error(err);
        grunt.fail.warn('Archiving failed.');
      });

      archive.on('entry', function(file) {
        grunt.verbose.writeln('Archived ' + file.name);
      });

      destStream.on('error', function(err) {
        grunt.log.error(err);
        grunt.fail.warn('WriteStream failed.');
      });

      destStream.on('close', function() {
        var size = archive.pointer();
        grunt.log.ok('Created ' + chalk.cyan(dest) + ' (' + size + ' bytes)');

        // FIXME: can async() callback be leveraged?
        callback();

        done();
      });

      archive.pipe(destStream);

      files.forEach(function(file) {
          var fstat = fileStatSync(file.src);

          if(!fstat) {
            grunt.fail.warn('unable to stat srcFile (' + file.src + ')');
            return;
          }

        if (fstat.isDirectory()) {
          grunt.verbose.writeln('Directory found:' + file.src);
          archive.directory(file.src, file.dest);
        } else {
          grunt.fail.warn(file.src + ' is not a valid directory');
          return;
        }
      });

      archive.finalize();
      grunt.log.ok('Compressed files');
    }

    function fileStatSync() {
      var filepath = path.join.apply(path, arguments);

      if (grunt.file.exists(filepath)) {
        return fs.statSync(filepath);
      }

      return false;
    }

    function cleanup() {
      grunt.file.delete(jcrRootPath);
      grunt.file.delete(metaInfPath);
    }
  });
};
