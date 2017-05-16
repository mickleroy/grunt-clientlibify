/*
 * grunt-clientlibify
 * https://github.com/mickleroy/grunt-clientlibify
 *
 * Copyright (c) 2017 Michael Leroy
 * Licensed under the MIT license.
 */

'use strict';

var fs       = require('fs');
var path     = require('path');
var archiver = require('archiver');
var request  = require('request');
var uri      = require('urijs');
var tmp      = require('tmp');

// grab the location from where the script is running from
// i.e. ~/projects/myproj/node_modules/grunt-clientlibify/tasks/
var taskDir = __dirname;

module.exports = function (grunt) {

    var templates = {
        designContent:    taskDir + '/templates/designContent.xml',
        clientlibContent: taskDir + '/templates/clientlibContent.xml',
        filterXml:        taskDir + '/templates/filter.xml',
        folderContent:    taskDir + '/templates/folderContent.xml',
        jcrRootContent:   taskDir + '/templates/jcrRootContent.xml',
        propertiesXml:    taskDir + '/templates/properties.xml'
    }

    grunt.registerMultiTask('clientlibify', 'Integrate AEM with a styleguide', function () {

        var options = this.options({
            dest: 'tmp',
            assetsDirs: [],
            installPackage: false,
            categories: ['etc-clientlibify'],
            embed: [],
            dependencies: [],
            jsProcessor: [],
            cssProcessor: [],
            packageName: 'clientlibify',
            packageVersion: '1.0',
            packageGroup: 'my_packages',
            packageDescription: 'CRX package installed using the grunt-clientlibify plugin',
            deployScheme: 'http',
            deployHost: 'localhost',
            deployPort: '4502',
            deployUsername: 'admin',
            deployPassword: 'admin'
        });

        // set the main category as the first categories entry
        options.category = options.categories[0];

        // validate mandatory config
        if (!options.cssDir && !options.jsDir) {
            grunt.log.error('cssDir and/or jsDir must be provided');
            return false;
        }

        if (options.cssDir && !grunt.file.isDir(options.cssDir)) {
            grunt.log.error(options.cssDir + ' is not a directory');
            return false;
        }

        if (options.jsDir && !grunt.file.isDir(options.jsDir)) {
            grunt.log.error(options.jsDir + ' is not a directory');
            return false;
        }

        // create a system tmp directory to store our task files
        var tmpWorkingDir = tmp.dirSync({prefix: 'grunt_clientlibify_', unsafeCleanup: true}).name;

        var jcrRootPath = path.join(tmpWorkingDir, '/jcr_root');
        var metaInfPath = path.join(tmpWorkingDir, '/META-INF');

        var clientlibRootDir = path.join(jcrRootPath, '/etc/designs/', options.category);
        var clientlibFolderLocation = path.join(clientlibRootDir, '/clientlibs');
        var vaultPath = path.join(metaInfPath, '/vault');

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
            grunt.log.subhead('Processing CSS directory');
            generateClientLibrarySection('css', options.cssDir, ['*.css', '*.less']);
        }

        // create js directory
        if (options.jsDir) {
            grunt.log.subhead('Processing Javascript directory');
            generateClientLibrarySection('js', options.jsDir, ['*.js']);
        }

        // transfer other assets (images, fonts, etc)
        if (options.assetsDirs.length) {
            grunt.log.subhead('Processing Assets directories');

            options.assetsDirs.forEach(function (assetsSrc) {
                var assetsDest = path.basename(assetsSrc);
                grunt.log.writeln('Processing assets in: ' + assetsSrc);

                // check provided asset directory
                if (!grunt.file.isDir(assetsSrc)) {
                    grunt.log.warn(assetsSrc + ' is not a directory, skipping...');
                    return;
                }

                var files = grunt.file.expand({filter: 'isFile', cwd: assetsSrc, matchBase: true}, '*');

                // copy files over to client library
                files.forEach(function (file) {
                    grunt.verbose.writeln(file);
                    grunt.file.copy(path.join(assetsSrc, file), path.join(clientlibFolderLocation, assetsDest, file));
                });
            });
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
        var zipFileLocation = path.join(options.dest, options.packageName + '-' + options.packageVersion + '.zip');

        var done = this.async();

        grunt.log.subhead('Creating CRX package');
        zipDirectory(directoriesToZip, zipFileLocation, function () {
            // only install the CRX package if the `installPackage` option
            // was set to `true`
            if (options.installPackage) {
                grunt.log.subhead('Installing CRX package');
                installPackage(zipFileLocation, function (err, httpResponse, body) {
                    if (typeof httpResponse == 'undefined') {
                        grunt.log.error('Upload failed');
                        done(false);
                        return;
                    } else if (httpResponse.statusCode !== 200) {
                        grunt.log.error('Upload failed: ', httpResponse.statusCode + ' - ' + httpResponse.statusMessage);
                        done(false);
                        return;
                    }
                    grunt.verbose.writeln('Server responded with:');
                    grunt.verbose.writeln(body);
                    grunt.log.ok('CRX package uploaded successfully!');

                    done();
                });
            } else {
                done();
            }
        });

        /*****************************
         *    UTILITY FUNCTIONS      *
         *****************************/

        /**
         * Generates a section of the client library (JS or CSS), creating a js.txt or css.txt.
         * @param name
         * @param pathToSrcDirectory
         * @param fileExtensions
         */
        function generateClientLibrarySection(name, pathToSrcDirectory, fileExtensions) {
            grunt.log.writeln('Processing files in: ' + pathToSrcDirectory);

            grunt.file.mkdir(path.join(clientlibFolderLocation, name));

            // get all files for this section
            var files = grunt.file.expand({filter: 'isFile', cwd: pathToSrcDirectory, matchBase: true}, fileExtensions);

            // write .txt file
            grunt.verbose.writeln('Creating ' + name + '.txt file');
            grunt.file.write(path.join(clientlibFolderLocation, name + '.txt'),
                "#base=".concat(name).concat('\n')
                    .concat(files.join('\n')));

            // copy files over to client library
            grunt.verbose.writeln('Copying files...');
            files.forEach(function (file) {
                grunt.file.copy(path.join(pathToSrcDirectory, file), path.join(clientlibFolderLocation, name, file));
            });
        }

        /**
         * Zips a set of directories and its contents using node-archiver.
         * @param directories
         * @param dest
         * @param callback
         */
        function zipDirectory(directories, dest, callback) {
            var archive = archiver.create('zip', {gzip: false});

            // ensure dest folder exists
            grunt.file.mkdir(path.dirname(dest));

            // Where to write the file
            var destStream = fs.createWriteStream(dest);

            archive.on('error', function (err) {
                grunt.log.error(err);
                grunt.fail.warn('Archiving failed.');
            });

            archive.on('entry', function (file) {
                grunt.verbose.writeln('Archived ' + file.name);
            });

            destStream.on('error', function (err) {
                grunt.log.error(err);
                grunt.fail.warn('WriteStream failed.');
            });

            destStream.on('close', function () {
                var size = archive.pointer();
                grunt.log.ok('Created ' + dest + ' (' + size + ' bytes)');

                callback();
            });

            archive.pipe(destStream);

            directories.forEach(function (directory) {
                var fstat = fileStatSync(directory.src);

                if (!fstat) {
                    grunt.fail.warn('unable to stat srcFile (' + directory.src + ')');
                    return;
                }

                if (fstat.isDirectory()) {
                    grunt.verbose.writeln('Directory found:' + directory.src);
                    archive.directory(directory.src, directory.dest);
                } else {
                    grunt.fail.warn(directory.src + ' is not a valid directory');
                    return;
                }
            });

            archive.finalize();
            grunt.verbose.writeln('Compressed files');
        }

        /**
         * Retrieves stat info about a file/directory if it exists.
         * @returns {boolean}
         */
        function fileStatSync() {
            var filepath = path.join.apply(path, arguments);

            if (grunt.file.exists(filepath)) {
                return fs.statSync(filepath);
            }

            return false;
        }

        /**
         * Installs a CRX package via an HTTP POST (basic authentication)
         * to an AEM instance.
         * @param zipFileLocation
         * @param callback
         */
        function installPackage(zipFileLocation, callback) {
            var formData = {
                'file': fs.createReadStream(zipFileLocation),
                'force': 'true',
                'install': 'true',
            };

            var postUri = uri()
                .scheme(options.deployScheme)
                .host(options.deployHost)
                .port(options.deployPort)
                .path('/crx/packmgr/service.jsp');

            grunt.log.writeln('Installing CRX package to ' + postUri.toString());

            request.post({
                url: postUri.toString(),
                formData: formData,
                headers: {
                    'Authorization': 'Basic ' +
                    new Buffer(options.deployUsername + ':' +
                        options.deployPassword).toString('base64')
                }
            }, callback);
        }
    });
};
