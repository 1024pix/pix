const {describe, it, beforeEach, afterEach, sinon, expect} = require('../../../test-helper');
const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../../lib/settings');
const {InvalidTokenError} = require('../../../../lib/domain/errors');

const authorizationToken = require('../../../../lib/infrastructure/validators/jsonwebtoken-verify');

describe('Unit | Validator | json-web-token-verify', function() {

  describe('#Validator:', function() {
    it('should be a function', () => {
      expect(authorizationToken.verify).to.be.a('function');
    });

    describe('Error management', _ => {
      [
        '',
        ' ',
        'BEARER ',
        'VALID_TOKEN',
        undefined,
        null
      ].forEach((token) => {
        it(`should reject a promise, when authorization is non-valid (${token})`, () => {
          // When
          const promise = authorizationToken.verify(token);
          return promise.catch((result) => {
            // Then
            expect(result.name).to.be.equal('Error');
            expect(result instanceof InvalidTokenError).to.be.true;
          });
        });
      });

    });

    describe('Success management', () => {

      let jsonwebtokenStub;
      beforeEach(function() {
        jsonwebtokenStub = sinon.stub(jsonwebtoken, 'verify', function(token, key, cb) {
          cb(null, {user_id: 1});
        });
      });

      afterEach(function() {
        jsonwebtokenStub.restore();
      });

      it('should reject a promise, when token is valid but has not key word bearer', () => {
        // When
        const promise = authorizationToken.verify('VALID_TOKEN');

        return promise.catch(_ => {
          // Then
          expect(promise).to.be.rejected;
        });
      });

      it('should resolve a promise, when token is valid', () => {
        // When
        const promise = authorizationToken.verify('Bearer VALID_TOKEN');

        return promise.then((result) => {
          // Then
          expect(promise).to.be.fulfilled;
          expect(result).to.be.equal(1);
          expect(jsonwebtokenStub.getCall(0).args[0]).to.be.equal('VALID_TOKEN');
          expect(jsonwebtokenStub.getCall(0).args[1]).to.be.equal(settings.authentication.secret);
        });
      });
    });
  });
});
