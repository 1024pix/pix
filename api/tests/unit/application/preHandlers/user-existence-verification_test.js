const { expect, sinon, hFake } = require('../../../test-helper');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const errorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const { UserNotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Pre-handler | User Verification', () => {

  describe('#verifyById', () => {
    const request = {
      params: {
        id: 7
      }
    };

    beforeEach(() => {
      sinon.stub(userRepository, 'get');
      sinon.stub(errorSerializer, 'serialize');
    });

    it('should be a function', () => {
      // then
      expect(userVerification.verifyById).to.be.a('function');
    });

    describe('When user exist', () => {

      it('should passthrough to handler', async () => {
        // given
        const userCount = 1;
        userRepository.get.resolves(userCount);

        // when
        const response = await userVerification.verifyById(request, hFake);

        // then
        sinon.assert.calledOnce(userRepository.get);
        sinon.assert.calledWith(userRepository.get, request.params.id);
        expect(response).to.equal(userCount);
      });

    });

    describe('When user doesn’t exist', async () => {

      it('should reply 404 status with a serialized error and takeOver the request', async () => {
        // given
        userRepository.get.rejects(new UserNotFoundError());
        const serializedError = { serialized: 'error' };
        errorSerializer.serialize.returns(serializedError);

        // when
        const response = await userVerification.verifyById(request, hFake);

        // then
        expect(response.source).to.deep.equal(serializedError);
        expect(response.isTakeOver).to.be.true;
        expect(response.statusCode).to.equal(404);
      });

    });
  });
});
