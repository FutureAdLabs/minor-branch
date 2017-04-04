#!/usr/bin/env node

var npm = require('npm');
var semver = require('semver');
var spawn = require('child_process').spawn;
var path = require('path');
var package_json = require(path.join(process.cwd(), 'package.json'));

var BRANCH_EXISTS = 128;

function getCurrentVersion() {
  return package_json.version;
}

function createPreviousMinorBranch(tag) {
  var major = semver.major(tag),
    minor = semver.minor(tag),
    branch = 'v' + major + '.' + minor;
  var params = {stdio: 'inherit'};
  spawn('git', ['branch', branch, 'v' + tag], params).on('close', function(err, res) {
    if (err && err !== BRANCH_EXISTS) {
      console.error('Error creating branch:', err);
      process.exit(err);
    } else if (err === BRANCH_EXISTS) {
      console.log('Branch ' + branch + ' already exists');
    } else {
      console.log('Branch ' + branch + ' successfully created');
      spawn('git', ['push', 'origin', branch], params).on('close', function(err, res) {
        if (err) {
          console.error('Error pushing branch:', err);
        } else {
          console.log('Branch ' + branch + ' successfully pushed');
        }
      });
    }
  });
}

var run = module.exports = function run() {
  var version = getCurrentVersion(),
    patch = semver.patch(version);

  //This is how we know they did a major/minor release
  if (patch !== 0) {
    return;
  }
  createPreviousMinorBranch(version);
};

if (require.main === module) {
  run();
}
