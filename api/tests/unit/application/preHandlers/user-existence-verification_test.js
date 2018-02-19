const { expect, sinon } = require('../../../test-helper');
const User = require('../../../../lib/infrastructure/data/user');
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
      sandbox.stub(userRepository, 'findUserById');
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
        userRepository.findUserById.resolves(userCount);

        // when
        const promise = userVerification.verifyById(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(userRepository.findUserById);
          sinon.assert.calledWith(userRepository.findUserById, request.params.id);
          sinon.assert.calledOnce(reply);
          sinon.assert.calledWith(reply, userCount);
        });
      });

    });

    describe('When user doesn’t exist', () => {

      it('should reply 404 status with a serialized error and takeOver the request', () => {
        // given
        userRepository.findUserById.rejects(User.NotFoundError());
        const serializedError = {};
        errorSerializer.serialize.returns(serializedError);

        // when
        const promise = userVerification.verifyById(request, reply);

        // then
        return promise.catch(() => {
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
