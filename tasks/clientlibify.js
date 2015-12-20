/*
 * grunt-clientlibify
 * https://github.com/mickleroy/grunt-clientlibify
 *
 * Copyright (c) 2015 Michael Leroy
 * Licensed under the MIT license.
 */

'use strict';

var archiver = require('archiver');
var fs = require('fs');

module.exports = function(grunt) {

  var util = grunt.util || grunt.utils;
  var _ = util._;

  grunt.registerMultiTask('clientlibify', 'Integrate AEM with a styleguide', function() {

      var options = this.options({
          dest: 'tmp',
          category: 'etc-clientlibify',
          embed: [],
          dependencies: []
      });

      // validate mandatory config
      if(options.cssDir && !grunt.file.isDir(options.cssDir)) {
          grunt.log.error(options.cssDir + ' is not a directory');
          return false;
      }

      if(options.jsDir && !grunt.file.isDir(options.jsDir)) {
          grunt.log.error(options.jsDir + ' is not a directory');
          return false;
      }

      // create design folder
      var designFolderLocation = options.dest + '/' + options.category;
      var clientlibFolderLocation = designFolderLocation + '/clientlibs';

      grunt.file.mkdir(designFolderLocation);

      // create .content.xml for design folder
      // type: cq:Page
      var designFileContents = grunt.template.process(
          '<?xml version="1.0" encoding="UTF-8"?>\n\
            <jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" \n\
                xmlns:jcr="http://www.jcp.org/jcr/1.0" \n\
                xmlns:nt="http://www.jcp.org/jcr/nt/1.0" \n\
                jcr:primaryType="cq:Page"> \n\
                <clientlibs/> \n\
            </jcr:root>', {data: options});

      grunt.file.write(designFolderLocation + '/.content.xml', designFileContents);

      // create .content.xml for clientlib folder
      // type: cq:ClientLibraryFolder
      var clientLibFileContents = grunt.template.process(
          '<?xml version="1.0" encoding="UTF-8"?>\n\
          <jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"\n\
              jcr:primaryType="cq:ClientLibraryFolder"\n\
              categories="[<%= category %>]"\n\
              embed="[<%= dependencies %>]"\n\
              dependencies="[<%= dependencies %>]"/>', {data: options});

      grunt.file.write(clientlibFolderLocation + '/.content.xml', clientLibFileContents);

      // create css directory
      if(options.cssDir) {
          grunt.file.mkdir(clientlibFolderLocation + '/css');

          // write css.txt file
          var files = grunt.file.expand({filter: 'isFile', cwd: options.cssDir}, ['*.css', '*.less']);
          grunt.file.write(clientlibFolderLocation + '/css.txt',
                        "#base=css".concat('\n').concat(files.join('\n')));

          // copy files over to css directory
          grunt.file.recurse(options.cssDir, function(abspath, rootdir, subdir, filename) {
              grunt.file.copy(abspath, clientlibFolderLocation + '/css/' + filename);
          });
      }

      // create js directory
      if(options.jsDir) {
          grunt.file.mkdir(clientlibFolderLocation + '/js');

          // write js.txt file
          var files = grunt.file.expand({filter: 'isFile', cwd: options.jsDir}, ['*.js']);
          grunt.file.write(clientlibFolderLocation + '/js.txt',
              "#base=js".concat('\n').concat(files.join('\n')));

          // copy files over to css directory
          grunt.file.recurse(options.jsDir, function(abspath, rootdir, subdir, filename) {
              grunt.file.copy(abspath, clientlibFolderLocation + '/js/' + filename);
          });
      }

      // zip up the clientlib
      var output = fs.createWriteStream(options.dest + '/file.zip');
      var archive = archiver('zip', {});

      output.on('close', function() {
         grunt.log.writeln(archive.pointer + ' total bytes');
      });

      output.on('error', function() {
          grunt.log.error('An error occurred zipping up the client library');
         throw err;
      });

      archive.pipe(output);
      archive.directory(clientlibFolderLocation, options.dest);
      archive.finalize();
  });

};
