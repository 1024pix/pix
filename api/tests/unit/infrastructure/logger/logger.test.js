const { expect } = require('../../../test-helper');
const { spawn } = require('child_process');
const path = require('path');

describe('Unit | Infrastructure | Logger', function () {
  describe('when #error and logging for server', function () {
    it('should send message to stdout, as JSON, no color, and tagged as error', function (done) {
      const scenarioFilePath = path.join(__dirname, './scenarios/error-for-machine.js');
      const process = spawn('node', [scenarioFilePath]);

      process.stdout.on('data', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.level).to.equal(50);
        expect(message.msg).to.equal('message');
        expect(message.time).not.to.be.null;
        expect(message.pid).not.to.be.null;
        expect(message.hostname).not.to.be.null;

        process.kill('SIGINT');
        done();
      });
    });
  });
  describe('when http request', function () {
    it('should send message to stdout, excluding auth headers', function (done) {
      const scenarioFilePath = path.join(__dirname, './scenarios/http-request.js');
      const process = spawn('node', [scenarioFilePath]);

      process.stdout.on('data', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.level).to.equal(30);
        expect(message.time).not.to.be.null;
        expect(message.pid).not.to.be.null;
        expect(message.hostname).not.to.be.null;

        expect(message.req.headers.type).to.equal('JSON');
        expect(message.req.headers.authorization).to.equal('[Redacted]');
        expect(message.req.method).to.equal('GET');

        process.kill('SIGINT');
        done();
      });
    });
  });
  describe('when #info and logging for human', function () {
    it('should send message to stdout, as string, colorized, and tagged as info', function (done) {
      const scenarioFilePath = path.join(__dirname, './scenarios/info-for-human.js');
      const process = spawn('node', [scenarioFilePath]);

      process.stdout.on('data', (data) => {
        const message = data.toString();
        expect(message.indexOf('INFO')).not.to.equal(-1);
        expect(message.indexOf('\x1B[32mINFO\x1B[39m')).not.to.equal(-1);
        expect(message.indexOf('message')).not.to.equal(-1);
        expect(message.indexOf('\x1B[36mmessage\x1B[39m')).not.to.equal(-1);
        expect(message.indexOf('\n')).not.to.equal(-1);
        process.kill('SIGINT');
        done();
      });
    });
  });
  describe('when disabled', function () {
    it('should not send message to stdout', function (done, fail) {
      const scenarioFilePath = path.join(__dirname, './scenarios/no-log.js');
      const process = spawn('node', [scenarioFilePath]);
      setTimeout(done, 300);
      process.stdout.on('data', () => {
        fail();
      });
    });
  });
  describe('when #info while min level is error', function () {
    it('should not send message to stdout', function (done, fail) {
      const scenarioFilePath = path.join(__dirname, './scenarios/info-when-error-min-level.js');
      const process = spawn('node', [scenarioFilePath]);
      setTimeout(done, 300);
      process.stdout.on('data', () => {
        fail();
      });
    });
  });
});
