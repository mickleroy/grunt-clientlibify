'use strict';

var grunt = require('grunt');
var fs = require('fs');
var path = require('path');
var unzip = require('unzip');

exports.clientlibify = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },
    default_options: function (test) {
        test.expect(1);

        var zipFile = path.join('tmp', 'clientlibify-1.0.zip');
        var expected = [
            "META-INF/vault/",
            "META-INF/vault/filter.xml",
            "META-INF/vault/properties.xml",
            "jcr_root/.content.xml",
            "jcr_root/etc/",
            "jcr_root/etc/.content.xml",
            "jcr_root/etc/designs/",
            "jcr_root/etc/designs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/",
            "jcr_root/etc/designs/etc-clientlibify/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/buttons/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/buttons/buttons.css",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/test.css",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/test2.less",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css.txt",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js/test.js",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js.txt"
        ];
        var actual = [];

        // read the zip file generated
        var parse = unzip.Parse();
        fs.createReadStream(zipFile).pipe(parse);

        parse.on('entry', function (entry) {
            actual.push(entry.path);
        });

        parse.on('close', function () {
            actual.sort();
            expected.sort();

            // assert contents of zip file
            test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');

            // delete generated file
            //grunt.file.delete(zipFile);

            test.done();
        });
    },
    custom_package_options: function (test) {
        test.expect(1);

        var zipFile = path.join('tmp', 'aem-styleguide-2.1.zip');
        var expected = [
            "META-INF/vault/",
            "META-INF/vault/filter.xml",
            "META-INF/vault/properties.xml",
            "jcr_root/.content.xml",
            "jcr_root/etc/",
            "jcr_root/etc/.content.xml",
            "jcr_root/etc/designs/",
            "jcr_root/etc/designs/.content.xml",
            "jcr_root/etc/designs/styleguide/",
            "jcr_root/etc/designs/styleguide/.content.xml",
            "jcr_root/etc/designs/styleguide/clientlibs/",
            "jcr_root/etc/designs/styleguide/clientlibs/.content.xml",
            "jcr_root/etc/designs/styleguide/clientlibs/css/",
            "jcr_root/etc/designs/styleguide/clientlibs/css/buttons/",
            "jcr_root/etc/designs/styleguide/clientlibs/css/buttons/buttons.css",
            "jcr_root/etc/designs/styleguide/clientlibs/css/test.css",
            "jcr_root/etc/designs/styleguide/clientlibs/css/test2.less",
            "jcr_root/etc/designs/styleguide/clientlibs/css.txt",
            "jcr_root/etc/designs/styleguide/clientlibs/js/",
            "jcr_root/etc/designs/styleguide/clientlibs/js/test.js",
            "jcr_root/etc/designs/styleguide/clientlibs/js.txt"
        ];
        var actual = [];

        // read the zip file generated
        var parse = unzip.Parse();
        fs.createReadStream(zipFile).pipe(parse);

        parse.on('entry', function (entry) {
            actual.push(entry.path);
        });

        parse.on('close', function () {
            actual.sort();
            expected.sort();

            // assert contents of zip file
            test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');

            // delete generated file
            //grunt.file.delete(zipFile);

            test.done();
        });
    },
    css_only_options: function (test) {
        test.expect(1);

        var zipFile = path.join('tmp', 'css-styleguide-1.0.zip');
        var expected = [
            "META-INF/vault/",
            "META-INF/vault/filter.xml",
            "META-INF/vault/properties.xml",
            "jcr_root/.content.xml",
            "jcr_root/etc/",
            "jcr_root/etc/.content.xml",
            "jcr_root/etc/designs/",
            "jcr_root/etc/designs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/",
            "jcr_root/etc/designs/etc-clientlibify/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/buttons/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/buttons/buttons.css",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/test.css",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/test2.less",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css.txt"
        ];
        var actual = [];

        // read the zip file generated
        var parse = unzip.Parse();
        fs.createReadStream(zipFile).pipe(parse);

        parse.on('entry', function (entry) {
            actual.push(entry.path);
        });

        parse.on('close', function () {
            actual.sort();
            expected.sort();

            // assert contents of zip file
            test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');

            // delete generated file
            //grunt.file.delete(zipFile);

            test.done();
        });
    },
    js_only_options: function (test) {
        test.expect(1);

        var zipFile = path.join('tmp', 'js-styleguide-1.0.zip');
        var expected = [
            "META-INF/vault/",
            "META-INF/vault/filter.xml",
            "META-INF/vault/properties.xml",
            "jcr_root/.content.xml",
            "jcr_root/etc/",
            "jcr_root/etc/.content.xml",
            "jcr_root/etc/designs/",
            "jcr_root/etc/designs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/",
            "jcr_root/etc/designs/etc-clientlibify/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js/test.js",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js.txt"
        ];
        var actual = [];

        // read the zip file generated
        var parse = unzip.Parse();
        fs.createReadStream(zipFile).pipe(parse);

        parse.on('entry', function (entry) {
            actual.push(entry.path);
        });

        parse.on('close', function () {
            actual.sort();
            expected.sort();

            // assert contents of zip file
            test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');

            // delete generated file
            //grunt.file.delete(zipFile);

            test.done();
        });
    },
    extra_assets_options: function (test) {
        test.expect(1);

        var zipFile = path.join('tmp', 'extra-assets-1.0.zip');
        var expected = [
            "META-INF/vault/",
            "META-INF/vault/filter.xml",
            "META-INF/vault/properties.xml",
            "jcr_root/.content.xml",
            "jcr_root/etc/",
            "jcr_root/etc/.content.xml",
            "jcr_root/etc/designs/",
            "jcr_root/etc/designs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/",
            "jcr_root/etc/designs/etc-clientlibify/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/.content.xml",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/buttons/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/buttons/buttons.css",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/test.css",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css/test2.less",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/css.txt",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/img/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/img/alerts/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/img/alerts/success.png",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/img/alerts/success.svg",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/img/search.png",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js/",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js/test.js",
            "jcr_root/etc/designs/etc-clientlibify/clientlibs/js.txt"
        ];
        var actual = [];

        // read the zip file generated
        var parse = unzip.Parse();
        fs.createReadStream(zipFile).pipe(parse);

        parse.on('entry', function (entry) {
            actual.push(entry.path);
        });

        parse.on('close', function () {
            actual.sort();
            expected.sort();

            // assert contents of zip file
            test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');

            // delete generated file
            //grunt.file.delete(zipFile);

            test.done();
        });
    },
    processor_options: function (test) {
        test.expect(1);

        var zipFile = path.join('tmp', 'processors-1.0.zip');
        var expected = [
            "META-INF/vault/",
            "META-INF/vault/filter.xml",
            "META-INF/vault/properties.xml",
            "jcr_root/.content.xml",
            "jcr_root/etc/",
            "jcr_root/etc/.content.xml",
            "jcr_root/etc/designs/",
            "jcr_root/etc/designs/.content.xml",
            "jcr_root/etc/designs/styleguide/",
            "jcr_root/etc/designs/styleguide/.content.xml",
            "jcr_root/etc/designs/styleguide/clientlibs/",
            "jcr_root/etc/designs/styleguide/clientlibs/.content.xml",
            "jcr_root/etc/designs/styleguide/clientlibs/css/",
            "jcr_root/etc/designs/styleguide/clientlibs/css/buttons/",
            "jcr_root/etc/designs/styleguide/clientlibs/css/buttons/buttons.css",
            "jcr_root/etc/designs/styleguide/clientlibs/css/test.css",
            "jcr_root/etc/designs/styleguide/clientlibs/css/test2.less",
            "jcr_root/etc/designs/styleguide/clientlibs/css.txt",
            "jcr_root/etc/designs/styleguide/clientlibs/js/",
            "jcr_root/etc/designs/styleguide/clientlibs/js/test.js",
            "jcr_root/etc/designs/styleguide/clientlibs/js.txt"
        ];
        var actual = [];

        // read the zip file generated
        var parse = unzip.Parse();
        fs.createReadStream(zipFile).pipe(parse);

        parse.on('entry', function (entry) {
            actual.push(entry.path);
        });

        parse.on('close', function () {
            actual.sort();
            expected.sort();

            // assert contents of zip file
            test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');

            // delete generated file
            //grunt.file.delete(zipFile);

            test.done();
        });
    }
};
