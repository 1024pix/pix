import { UserNotFoundError } from '../../../../../lib/domain/errors.js';
import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { catchErr, databaseBuilder, expect, hFake } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Application | Controller | password', function () {
  describe('#createResetPasswordDemand', function () {
    const email = 'user@example.net';
    const headers = {
      'accept-language': 'fr',
    };
    const payload = {
      data: {
        type: 'password-reset-demands',
        attributes: { email },
      },
    };

    it('returns a 201 HTTP status code with a response', async function () {
      // given
      const request = { headers, payload };

      const userId = databaseBuilder.factory.buildUser({ email }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();

      // when
      const response = await passwordController.createResetPasswordDemand(request, hFake);

      // then
      expect(response.statusCode).to.equal(201);
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

    context('when user account does not exist with given email', function () {
      it('throws a UserNotFoundError', async function () {
        // given
        const request = { headers, payload };

        // when
        const error = await catchErr(passwordController.createResetPasswordDemand)(request, hFake);

        // then
        expect(error).to.be.instanceOf(UserNotFoundError);
      });
    });
  });
});
