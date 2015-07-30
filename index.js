#!/usr/bin/env node

var npm = require('npm');
var semver = require('semver');
var spawn = require('child_process').spawn;
var path = require('path');
var package_json = require(path.join(process.cwd(), 'package.json'));

var BRANCH_EXISTS = 128;

function getCurrentVersion(){
	return package_json.version;
}

function getCurrentName(){
	return package_json.name;
}

function getVersions(npmViewData){
	return npmViewData[Object.keys(npmViewData)[0]].versions;
}

function createPreviousMinorBranch(tag){
	var major = semver.major(tag),
		minor = semver.minor(tag),
		branch = 'v' + major + '.' + minor;

	spawn('git', ['branch', branch, 'v' + tag], {
		stdio: 'inherit'
	})
		.on('close', function(err, res){
			if(err && err !== BRANCH_EXISTS){
				console.error('Error creating branch:', err);
				process.exit(err);
			}
			else if(err === BRANCH_EXISTS){
				console.log('Branch ' + branch + ' already exists');
			}
			else{
				console.log('Branch ' + branch + ' successfully created');
			}
		});
}

var run = module.exports = function run(){
	var version = getCurrentVersion(),
		patch = semver.patch(version);

	//This is how we know they did a major/minor release
	if(patch !== 0){
		return;
	}

	npm.load({}, function(){
		npm.commands.view([getCurrentName(), 'versions'], true, function(err, data){
			var tagToBranch = semver.maxSatisfying(getVersions(data), '<' + version);

			createPreviousMinorBranch(tagToBranch);
		})
	});
};

if(require.main === module){
	run();
}
