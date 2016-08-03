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
      jsconfig_path: './backstop.js',
      config_path: './backstop.json',
      backstop_path: './node_modules/backstopjs',
      test_path: './backstop_data',
      gen_config: false,
      create_references: false,
      run_tests: false,
      report: false
    });

    var exec = require('child_process').exec,
        async = require('async'),
        path = require('path');

    var cwd = process.cwd(),
        done = this.async();

    function BackstopJS(data, done) {
      this.backstop_path = path.join(cwd, data.backstop_path);
      this.test_path = path.join(cwd, data.test_path);
      this.jsconfig_path = path.join(cwd, data.jsconfig_path);
      this.config_path = path.join(cwd, data.config_path);
      this.cmd_args = '-- --jsConfig=' + this.jsconfig_path + ' --configPath=' + this.config_path;
      this.options = {
        gen_config: data.gen_config,
        create_references: data.create_references,
        run_tests: data.run_tests,
        report: data.report
      };
      this.done = done;

      this.log = function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err !== null) {
          console.log('ERROR: ' + err);
        }
      };

      this.startServer = function() {
        var cmd = 'npm run start ' + this.cmd_args;
        exec(cmd, { cwd: this.backstop_path }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
        }.bind(this));
      }.bind(this);

      this.genConfig = function(cb) {
        var cmd = 'npm run genConfig ' + this.cmd_args;
        exec(cmd, { cwd: this.backstop_path }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };

      this.createReferences = function(cb) {
        var cmd = 'npm run reference ' + this.cmd_args;
        exec(cmd, { cwd: this.backstop_path, maxBuffer: 1024*5000 }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };

      this.report = function(cb) {
        this.startServer();
        var cmd = 'npm run openReport ' + this.cmd_args;
        exec(cmd, { cwd: this.backstop_path }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };

      this.runTests = function(cb) {
        var cmd = 'npm run test ' + this.cmd_args;
        exec(cmd, { cwd: this.backstop_path, maxBuffer: 1024*5000 }, function(err, stdout, stderr) {
          this.log(err, stdout, stderr);
          cb(true);
        }.bind(this));
      };
    }
    
    var backstopLoader = new BackstopJS(options, done);

    async.series([
      function(cb) {
        if(this.options.gen_config) {
          this.genConfig(function() {
            cb();
          });
        } else {
          cb();
        }
      }.bind(backstopLoader),

      function(cb) {
        if(this.options.prep_env) {
          this.prepEnv(function() {
            cb();
          });
        } else {
          cb();
        }
      }.bind(backstopLoader),
     
      function(cb) {
        if(this.options.create_references) {
          this.createReferences(function() {
            cb();
          });
        } else {
          cb();
        }
      }.bind(backstopLoader),

     function(cb) {
      if(this.options.run_tests) {
        this.runTests(function() {
          cb();
        });
      } else {
        cb();
      }
     }.bind(backstopLoader),

     function(cb) {
       if(this.options.report) {
         this.report(function() {
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
