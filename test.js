var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');

var path = require('path');

chai.use(require('sinon-chai'));

var rewire = require('rewire');

var minorBranch = rewire('./index');

var mockOn = sinon.spy();
var mockSpawn = sinon.spy(function(){
	return {
		on: mockOn
	};
});
var mockNpm = {
	load: sinon.spy(),
	commands: {
		view: sinon.spy()
	}
};

minorBranch.__set__('spawn', mockSpawn);
minorBranch.__set__('npm', mockNpm);
minorBranch.__set__('package_json', {
	name: 'test-module',
	version: '3.6.0'
});

describe('minor branch', function(){
	beforeEach(function(){
		mockOn.reset();
		mockSpawn.reset();
		mockNpm.load.reset();
		mockNpm.commands.view.reset();
	});

	it('should create a branch with the previous minor version', function(){
		minorBranch();

		mockNpm.load.lastCall.args[1](); //Callback provided to npm.load

		expect(mockNpm.commands.view).to.have.been.calledWith(sinon.match(['test-module', 'versions']));

		//Callback provided to npm.commands.view
		mockNpm.commands.view.lastCall.args[2](undefined, {
			"3.6.0": {
				versions: [
					"3.5.4",
					"3.5.3",
					"3.5.2",
					"3.5.1",
					"3.5.0",
					"3.4.1",
					"3.4.0",
					"3.3.0",
					"3.2.0",
					"3.1.0",
					"3.0.0",
					"2.0.0",
					"1.0.0",
					"0.0.0"
				]
			}
		});

		expect(mockSpawn).to.have.been.calledWith('git', sinon.match(['branch', 'v3.5', 'v3.5.4']));
	});

	it('should not call anything if it is not a version ending in a 0', function(){
		minorBranch.__set__('package_json', {
			name: 'test-module',
			version: '3.6.1'
		});

		minorBranch();

		expect(mockNpm.load).not.to.have.been.called;
		expect(mockNpm.commands.view).not.to.have.been.called;
		expect(mockSpawn).not.to.have.been.called;
	});
});
