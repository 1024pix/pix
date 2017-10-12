const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { UserNotFoundError } = require('../../../../lib/domain/errors');
const errorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

describe('Unit | Pre-handler | User Verification', () => {

  describe('#verifyById', () => {

    let sandbox;
    let reply;
    let codeStub;
    let takeOverStub;
    const request = {
      params: {
        id: 7
      }
    };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(userRepository, 'countUserById');
      sandbox.stub(errorSerializer, 'serialize');

      takeOverStub = sandbox.stub();
      codeStub = sandbox.stub().returns({
        takeover: takeOverStub
      });
      reply = sandbox.stub().returns({
        code: codeStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be a function', () => {
      // then
      expect(userVerification.verifyById).to.be.a('function');
    });

    describe('When user exist', () => {

      it('should passthrough to handler', () => {
        // given
        const userCount = 1;
        userRepository.countUserById.resolves(userCount);

        // when
        const promise = userVerification.verifyById(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(userRepository.countUserById);
          sinon.assert.calledWith(userRepository.countUserById, request.params.id);
          sinon.assert.calledOnce(reply);
          sinon.assert.calledWith(reply, userCount);
        });
      });

    });

    describe('When user doesn’t exist', () => {

      it('should reply 404 status with a serialized error and takeOver the request', () => {
        // given
        userRepository.countUserById.resolves(null);
        const serializedError = {};
        errorSerializer.serialize.returns(serializedError);

        // when
        const promise = userVerification.verifyById(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(takeOverStub);
          sinon.assert.calledOnce(codeStub);
          sinon.assert.calledOnce(errorSerializer.serialize);
          sinon.assert.calledWith(codeStub, 404);
          sinon.assert.calledWith(reply, serializedError);
          sinon.assert.calledWith(errorSerializer.serialize, new UserNotFoundError().getErrorMessage());
        });
      });

    });
  });
});
