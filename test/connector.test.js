'use strict';

const USER_NAME = 'ncanonizado@barhead.ph',
	  PASSWORD = 'reekohinc',
	  OBJ_NAME = 'standard1',
	  LOGIN_URL = 'http://www.rollbase.ph';

var cp     = require('child_process'),
	assert = require('assert'),
	connector;


describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function () {
		connector.kill('SIGKILL');
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			assert.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: {
						username: USER_NAME,
						password: PASSWORD,
						login_url : LOGIN_URL
					}
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});

	describe('#data', function (done) {
		it('should process the data', function () {

			var date = new Date();
			connector.send({
				type: 'data',
				data: {
					objName: OBJ_NAME,
					name: date.getTime(),
					carbon_monoxide: '8',
					hydrogen_sulphide: '16',
					nitrogen_dioxide: '18',
					ozone: '25',
					particulate_matter: '26',
					sulphur_dioxide: '44'
				}
			}, done);
		});
	});
});