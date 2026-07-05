import { createServer } from '../../../../../server.js';
import { PasswordExpirationToken } from '../../../../../src/identity-access-management/domain/models/PasswordExpirationToken.js';
import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { config } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Acceptance | Identity Access Management | Application | Route | password', function () {
  const email = 'user@example.net';
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/password-reset-demands', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'POST',
        url: '/api/password-reset-demands',
        payload: { email },
      };

      config.mailing.enabled = false;

      const userId = databaseBuilder.factory.buildUser({ email }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();
    });

    context('when given email doesn’t exist', function () {
      it('replies with 204', async function () {
        // given
        options.payload.email = 'unknown@example.net';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when given email exists', function () {
      it('returns a 204 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function () {
    const options = {
      method: 'GET',
      url: null,
    };

    context('when temporaryKey is not valid', function () {
      it('replies with 401 status code', async function () {
        // given
        options.url = '/api/password-reset-demands/invalid-temporary-key';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when temporaryKey is valid', function () {
      let temporaryKey;

      beforeEach(async function () {
        temporaryKey = await resetPasswordService.generateTemporaryKey();
        options.url = `/api/password-reset-demands/${temporaryKey}`;
      });

      context('when temporaryKey is not linked to a reset password demand', function () {
        it('replies with 404 status code', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when temporaryKey is linked to a password reset demand', function () {
        beforeEach(async function () {
          databaseBuilder.factory.buildUser({ email });
          databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

          await databaseBuilder.commit();
        });

        it('replies with 200 status code', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });

  describe('POST /api/expired-password-updates', function () {
    context('Success cases', function () {
      it('returns 201 HTTP status code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRawPassword({ shouldChangePassword: true });
        await databaseBuilder.commit();

        const passwordExpirationToken = PasswordExpirationToken.generate({ userId: user.id });
        const options = {
          method: 'POST',
          url: '/api/expired-password-updates',
          payload: {
            data: {
              attributes: {
                'password-reset-token': passwordExpirationToken,
                'new-password': 'Password02',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', function () {
      context('when shouldChangePassword is false', function () {
        it('responds 403 HTTP status code', async function () {
          // given
          const user = databaseBuilder.factory.buildUser.withRawPassword({ shouldChangePassword: false });
          await databaseBuilder.commit();

          const passwordExpirationToken = PasswordExpirationToken.generate({ userId: user.id });
          const options = {
            method: 'POST',
            url: '/api/expired-password-updates',
            payload: {
              data: {
                attributes: {
                  'password-reset-token': passwordExpirationToken,
                  'new-password': 'Password02',
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
