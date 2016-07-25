/*
 * grunt-backstopjs
 * https://github.com/dcarter/grunt-backstopjs
 *
 * Copyright (c) 2016 David Carter
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('backstopjs', 'BackstopJS test loader for grunt', function() {
  
    var options = this.options({
      backstop_path: './node_modules/backstopjs',
      test_path: './backstop_data',
      gen_config: false,
      prep_env: false,
      create_references: false,
      run_tests: false
    });

    var child_process = require('child_process'),
        async = require('async'),
        path = require('path');

    var cwd = process.cwd(),
        done = this.async();

    function BackstopJS(data, done) {
      this.backstop_path = path.join(cwd, data.backstop_path);
      this.test_path = path.join(cwd, data.test_path);
      this.options = {
        setup: data.setup,
        configure: data.configure,
        create_references: data.create_references,
        run_tests: data.run_tests
      };
      this.done = done;

      this.log = function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err !== null) {
          console.log('ERROR: ' + err);
        }
      };

      this.prepEnv = function(backstop_path, cb) {
        child_process.exec('npm install', { cwd: backstop_path }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };

      this.genConfig = function(backstop_path, cb) {
        child_process.exec('gulp genConfig', { cwd: backstop_path }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };

      this.createReferences = function(backstop_path, cb) {
        child_process.exec('gulp reference', { cwd: backstop_path }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };

      this.runTests = function(backstop_path, cp) {
        child_process.exec('gulp test', { cwd: backstop_path, maxBuffer: 1024*2000 }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };
    }
    
    var backstopLoader = new BackstopJS(options, done);

    async.series([
      function(cb) {
        if(this.options.gen_config) {
          this.genConfig(this.backstop_path, function() {
            cb();
          });
        } else {
          cb();
        }
      }.bind(backstopLoader),

      function(cb) {
        if(this.options.prep_env) {
          this.preEnv(this.backstop_path, function() {
            cb();
          });
        } else {
          cb();
        }
      }.bind(backstopLoader),
     
      function(cb) {
        if(this.options.create_references) {
          this.createReferences(this.backstop_path, function() {
            cb();
          });
        } else {
          cb();
        }
      }.bind(backstopLoader),

     function(cb) {
      if(this.options.run_tests) {
        this.runTests(this.backstop_path, function() {
          cb();
        });
      } else {
        cb();
      }
     }.bind(backstopLoader) 

    ], function(err, result) {
      this.done(true);
    }.bind(backstopLoader))
  });
};
