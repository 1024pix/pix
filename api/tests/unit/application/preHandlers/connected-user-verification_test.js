const { describe, it, sinon, beforeEach, afterEach } = require('../../../test-helper');
const tokenService = require('../../../../lib/domain/services/token-service');
const ConnectedUserVerification = require('../../../../lib/application/preHandlers/connected-user-verification');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const { UserNotAuthorizedToCertifyError } = require('../../../../lib/domain/errors');

describe('Unit | Pre-handler | Connected User Verification', () => {

  describe('#verifyByToken', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    let takeOverStub;
    const request = {
      headers: { authorization: 'VALID_TOKEN' }
    };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      takeOverStub = sinon.stub();
      sandbox.stub(tokenService, 'extractTokenFromAuthChain').returns('VALID_TOKEN');
      sandbox.stub(validationErrorSerializer, 'serialize');
      codeStub = sandbox.stub().returns({
        takeover: takeOverStub
      });
      replyStub = sandbox.stub().returns({
        code: codeStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should extract token from authorization field', function() {
      // when
      const promise = ConnectedUserVerification.verifyByToken(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(tokenService.extractTokenFromAuthChain);
        sinon.assert.calledWith(tokenService.extractTokenFromAuthChain, request.headers.authorization);
      });
    });

    it('should call verification from token', () => {
      // given
      sandbox.stub(tokenService, 'verifyValidity').resolves();

      // when
      const promise = ConnectedUserVerification.verifyByToken(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(tokenService.verifyValidity);
        sinon.assert.calledWith(tokenService.verifyValidity, request.headers.authorization);
      });
    });

    it('should reply if verification is ok', () => {
      // given
      sandbox.stub(tokenService, 'verifyValidity').resolves();

      // when
      const promise = ConnectedUserVerification.verifyByToken(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.called(replyStub);
      });
    });

    context('when user is not connected', () => {
      it('should return an error message', () => {
        const error = new UserNotAuthorizedToCertifyError();
        const expectedErrorMessage = error.getErrorMessage();
        const serializedError = {};
        validationErrorSerializer.serialize.returns(serializedError);
        sandbox.stub(tokenService, 'verifyValidity').rejects();

        // when
        const promise = ConnectedUserVerification.verifyByToken(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledOnce(validationErrorSerializer.serialize);
          sinon.assert.calledWith(validationErrorSerializer.serialize, expectedErrorMessage);
          sinon.assert.calledWith(replyStub, serializedError);
        });
      });

      it('should reply an 401 error', () => {
        // given
        sandbox.stub(tokenService, 'verifyValidity').rejects();

        // when
        const promise = ConnectedUserVerification.verifyByToken(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.called(replyStub);
          sinon.assert.calledWith(codeStub, 401);
          sinon.assert.called(takeOverStub);
        });
      });
    });
  });
});
