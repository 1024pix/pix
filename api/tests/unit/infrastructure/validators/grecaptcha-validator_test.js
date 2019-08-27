const request = require('request');
const { expect, sinon } = require('../../../test-helper');
const gRecaptcha = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const { InvalidRecaptchaTokenError } = require('../../../../lib/domain/errors');
const logger = require('../../../../lib/infrastructure/logger');
const { captcha } = require('../../../../lib/config');

const INVALID_OR_UNKNOW_RECAPTCHA = 'INVALID_RECAPTCHA';
const RECAPTCHA_TOKEN = 'a-valid-recaptch-token-should-be-a-string-of-512-numalpha-characters';
const SUCCESSFULL_VERIFICATION_RESPONSE = { 'body': '{\n  "success": true,\n "hostname": "",\n  "error-codes": [\n    "timeout-or-duplicate"\n  ]\n}' };
const UNSUCCESSFULL_VERIFICATION_RESPONSE = { 'body': '{\n  "success": false,\n "hostname": "",\n  "error-codes": [\n    "timeout-or-duplicate"\n  ]\n}' };

describe('Unit | Service | google-recaptcha-validator', () => {

  describe('#verify', () => {

    beforeEach(() => {
      sinon.stub(request, 'post');
    });

    afterEach(() => {
      request.post.restore();
    });

    context('when captcha is disabled', () => {

      it('should do nothing and resolve an empty promise when captcha validation is disabled', function() {
        // given
        captcha.enabled = false;

        // when
        const promise = gRecaptcha.verify('any response token');

        // then
        return expect(promise).to.be.fulfilled.then(() => {
          expect(request.post).to.not.have.been.called;
        });
      });
    });

    context('when captcha is enabled', () => {

      beforeEach(() => {
        captcha.enabled = true;
      });

      afterEach(() => {
        captcha.enabled = false;
      });

      it('should call google verify with good url and query parameters', function() {
        // given
        request.post.callsFake((uri, cb) => {
          // then
          expect(uri).to.equal(`https://www.google.com/recaptcha/api/siteverify?secret=${captcha.googleRecaptchaSecret}&response=${RECAPTCHA_TOKEN}`);

          cb(null, SUCCESSFULL_VERIFICATION_RESPONSE);
        });

        // when
        return gRecaptcha.verify(RECAPTCHA_TOKEN);
      });

      describe('Success case', function() {

        it('should return a resolved promise when user response token is valid', function() {
          // given
          request.post.callsArgWith(1, null, SUCCESSFULL_VERIFICATION_RESPONSE);

          // when
          const promise = gRecaptcha.verify(RECAPTCHA_TOKEN);

          // then
          return expect(promise).to.be.fulfilled.then(() => {
            expect(request.post).to.have.been.calledOnce;
          });
        });
      });

      describe('Error cases', function() {

        const error = new Error();

        beforeEach(() => {
          sinon.stub(logger, 'error').returns();
        });

        afterEach(() => {
          logger.error.restore();
        });

        it('should return a rejected promise, when user response token is invalid', function() {
          // given
          request.post.callsArgWith(1, null, UNSUCCESSFULL_VERIFICATION_RESPONSE);

          // when
          const promise = gRecaptcha.verify(INVALID_OR_UNKNOW_RECAPTCHA);

          // then
          return promise.catch((err) => {

            expect(promise).to.be.rejected;
            expect(promise).to.be.rejectedWith('Invalid reCaptcha token');
            expect(err instanceof InvalidRecaptchaTokenError).to.be.ok;

          });

        });

        it('should return a rejected promise when request failed for network reason', function() {
          // given
          request.post.callsArgWith(1, error);

          // when
          const promise = gRecaptcha.verify('foo-bar');

          // then
          return expect(promise).to.be.rejected.then((err) => {
            expect(err).to.equal('An error occurred during connection to the Google servers');
          });
        });

        it('should call logger once time, when request failed for network reason', function() {
          // given
          request.post.callsArgWith(1, error);

          // when
          const promise = gRecaptcha.verify('foo-bar');

          // then
          return expect(promise).to.be.rejected.then(() => {
            expect(logger.error).to.have.been.calledOnce;
          });
        });
      });
    });
  });
});

