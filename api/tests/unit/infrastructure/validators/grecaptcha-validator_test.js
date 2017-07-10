const { describe, it, expect, sinon, beforeEach, afterEach, before, after } = require('../../../test-helper');
const gRecaptcha = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const { InvalidRecaptchaTokenError } = require('../../../../lib/infrastructure/validators/errors');
const request = require('request');
const logger = require('../../../../lib/infrastructure/logger');
const { googleReCaptcha } = require('../../../../lib/settings');

const INVALID_OR_UNKNOW_RECAPTCHA = 'INVALID_RECAPTCHA';
const RECAPTCHA_TOKEN = 'a-valid-recaptch-token-should-be-a-string-of-512-numalpha-characters';
const SUCCESSFULL_VERIFICATION_RESPONSE = { 'body': '{\n  "success": true,\n "hostname": "",\n  "error-codes": [\n    "timeout-or-duplicate"\n  ]\n}' };
const UNSUCCESSFULL_VERIFICATION_RESPONSE = { 'body': '{\n  "success": false,\n "hostname": "",\n  "error-codes": [\n    "timeout-or-duplicate"\n  ]\n}' };

describe('Unit | Service | google-recaptcha-validator', () => {

  describe('#verify', () => {

    it('should be a function', function() {
      expect(gRecaptcha.verify).to.be.a('function');
    });

    it('should call google verify with good url and query parameters', function() {
      // given
      const requestPostStub = sinon.stub(request, 'post', function(uri, cb) {
        // then
        requestPostStub.restore();
        expect(uri).to.equal(`https://www.google.com/recaptcha/api/siteverify?secret=${googleReCaptcha.secret}&response=${RECAPTCHA_TOKEN}`);

        cb(null, SUCCESSFULL_VERIFICATION_RESPONSE);
      });

      // when
      return gRecaptcha.verify(RECAPTCHA_TOKEN);
    });

    describe('Success case', function() {
      let requestPostErrorStub;

      before(() => {
        requestPostErrorStub = sinon.stub(request, 'post');
      });

      after(() => {
        requestPostErrorStub.restore();
      });

      it('should return a resolved promise when user response token is valid', function() {
        // given
        requestPostErrorStub.callsArgWith(1, null, SUCCESSFULL_VERIFICATION_RESPONSE);

        // when
        const promise = gRecaptcha.verify(RECAPTCHA_TOKEN);

        return promise.then(() => {
          // Then
          expect(promise).to.be.resolved;
        });
      });

    });

    describe('Error cases', function() {

      let loggerStub;
      let requestPostErrorStub;
      const error = new Error();

      beforeEach(() => {
        loggerStub = sinon.stub(logger, 'error').returns({});
        requestPostErrorStub = sinon.stub(request, 'post');
      });

      afterEach(() => {
        loggerStub.restore();
        requestPostErrorStub.restore();
      });

      it('should return a rejected promise, when user response token is invalid', function() {
        // given
        requestPostErrorStub.callsArgWith(1, null, UNSUCCESSFULL_VERIFICATION_RESPONSE);

        // when
        const promise = gRecaptcha.verify(INVALID_OR_UNKNOW_RECAPTCHA);

        // Then
        return promise.catch((err) => {

          expect(promise).to.be.rejected;
          expect(promise).to.be.rejectedWith('Invalid reCaptcha token');
          expect(err instanceof InvalidRecaptchaTokenError).to.be.ok;

        });

      });

      it('should return a rejected promise when request failed for network reason', function() {
        // given
        requestPostErrorStub.callsArgWith(1, error);

        // when
        const promise = gRecaptcha.verify('foo-bar');
        return promise.catch((err) => {
          expect(promise).to.be.rejected;
          expect(err).to.be.equal('An error occurred during connection to the Google servers');
        });
      });

      it('should call logger once time, when request failed for network reason', function() {
        // given
        requestPostErrorStub.callsArgWith(1, error);
        // when
        return gRecaptcha.verify('foo-bar').catch(() => {
          sinon.assert.calledOnce(loggerStub);
        });
      });
    });

  });

});

