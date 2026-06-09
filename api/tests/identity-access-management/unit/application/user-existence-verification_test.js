import sinon from 'sinon';

import { userVerification } from '../../../../src/identity-access-management/application/user/user-existence-verification-pre-handler.js';
import { UserNotFoundError } from '../../../../src/shared/domain/errors.js';
import { expect } from '../../../test-helper.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Unit | Pre-handler | User Verification', function () {
  describe('#verifyById', function () {
    const request = {
      params: {
        id: 7,
      },
    };
    let userRepository;

    beforeEach(function () {
      userRepository = {
        get: sinon.stub(),
      };
    });

    describe('When user exist', function () {
      it('should passthrough to handler', async function () {
        // given
        const userCount = 1;
        userRepository.get.resolves(userCount);

        // when
        const response = await userVerification.verifyById(request, hFake, { userRepository });

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

        // when
        const response = await userVerification.verifyById(request, hFake, { userRepository });

        // then
        expect(response.source.errors.length).to.equal(1);
        expect(response.isTakeOver).to.be.true;
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
