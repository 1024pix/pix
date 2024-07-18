import { userVerification } from '../../../../src/identity-access-management/application/user/user-existence-verification-pre-handler.js';
import { UserNotFoundError } from '../../../../src/shared/domain/errors.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Pre-handler | User Verification', function () {
  describe('#verifyById', function () {
    const request = {
      params: {
        id: 7,
      },
    };
    let userRepository;
    let errorSerializer;

    beforeEach(function () {
      userRepository = {
        get: sinon.stub(),
      };
      errorSerializer = {
        serialize: sinon.stub(),
      };
    });

    describe('When user exist', function () {
      it('should passthrough to handler', async function () {
        // given
        const userCount = 1;
        userRepository.get.resolves(userCount);

        // when
        const response = await userVerification.verifyById(request, hFake, { userRepository, errorSerializer });

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
        const response = await userVerification.verifyById(request, hFake, { userRepository, errorSerializer });

        // then
        expect(response.source).to.deep.equal(serializedError);
        expect(response.isTakeOver).to.be.true;
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
