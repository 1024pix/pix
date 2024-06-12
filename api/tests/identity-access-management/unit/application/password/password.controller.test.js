import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | password', function () {
  describe('#createResetPasswordDemand', function () {
    const email = 'user@example.net';
    const locale = 'fr';
    const temporaryKey = 'ABCDEF123';
    const request = {
      headers: {
        'accept-language': locale,
      },
      payload: {
        data: {
          attributes: { email },
        },
      },
    };
    const resetPasswordDemand = {
      id: 1,
      email,
      temporaryKey,
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createResetPasswordDemand');
      usecases.createResetPasswordDemand.resolves(resetPasswordDemand);
    });

    context('when all went well', function () {
      it('replies with serialized reset password demand', async function () {
        // when
        const response = await passwordController.createResetPasswordDemand(request, hFake);

        // then
        expect(response.statusCode).to.equal(201);
        expect(usecases.createResetPasswordDemand).to.have.been.calledWithExactly({
          email,
          locale,
        });
        expect(response.source).to.deep.equal({
          data: {
            attributes: {
              email: 'user@example.net',
            },
            id: '1',
            type: 'password-reset-demands',
          },
        });
      });
    });
  });
});
