import { expect, sinon, hFake } from '../../../test-helper';
import userVerification from '../../../../lib/application/preHandlers/user-existence-verification';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';
import errorSerializer from '../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer';
import { UserNotFoundError } from '../../../../lib/domain/errors';

describe('Unit | Pre-handler | User Verification', function () {
  describe('#verifyById', function () {
    const request = {
      params: {
        id: 7,
      },
    };

    beforeEach(function () {
      sinon.stub(userRepository, 'get');
      sinon.stub(errorSerializer, 'serialize');
    });

    describe('When user exist', function () {
      it('should passthrough to handler', async function () {
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

    describe('When user doesn’t exist', function () {
      it('should reply 404 status with a serialized error and takeOver the request', async function () {
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
