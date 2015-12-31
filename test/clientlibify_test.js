'use strict';

var grunt = require('grunt');
var fs = require('fs');
var path = require('path');
var unzip = require('unzip');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.clientlibify = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(1);

    var zipFile = path.join('tmp', 'etc-clientlibify-1.0.zip');
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

    parse.on('entry', function(entry) {
      actual.push(entry.path);
    });

    parse.on('close', function() {
      actual.sort();
      expected.sort();

      // assert contents of zip file
      test.deepEqual(actual, expected, 'zip file should unzip and contain all of the expected files');

      // delete generated file
      grunt.file.delete(zipFile);

      test.done();
    });
  },
  /**
  custom_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/custom_options');
    var expected = grunt.file.read('test/expected/custom_options');
    test.equal(actual, expected, 'should describe what the custom option(s) behavior is.');

    test.done();
  },
   */
};
