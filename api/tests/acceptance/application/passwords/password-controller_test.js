import { databaseBuilder, expect, knex, sinon } from '../../../test-helper';
import tokenService from '../../../../lib/domain/services/token-service';
import resetPasswordService from '../../../../lib/domain/services/reset-password-service';
import resetPasswordDemandRepository from '../../../../lib/infrastructure/repositories/reset-password-demands-repository';
import config from '../../../../lib/config';
import createServer from '../../../../server';

describe('Acceptance | Controller | password-controller', function () {
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
        payload: {
          data: {
            attributes: { email },
          },
        },
      };

      config.mailing.enabled = false;

      const userId = databaseBuilder.factory.buildUser({ email }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('reset-password-demands').delete();
    });

    context('when email provided is unknown', function () {
      it('should reply with 404', async function () {
        // given
        options.payload.data.attributes.email = 'unknown@example.net';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when existing email is provided and email is delivered', function () {
      it('should reply with 201', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when existing email is provided, but some internal error has occured', function () {
      it('should reply with 500', async function () {
        // given
        sinon.stub(resetPasswordDemandRepository, 'create').rejects(new Error());

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(500);
      });
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function () {
    const options = {
      method: 'GET',
      url: null,
    };

    context('when temporaryKey is not valid', function () {
      it('should reply with 401 status code', async function () {
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

      beforeEach(function () {
        temporaryKey = resetPasswordService.generateTemporaryKey();
        options.url = `/api/password-reset-demands/${temporaryKey}`;
      });

      context('when temporaryKey is not linked to a reset password demand', function () {
        it('should reply with 404 status code', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when something going wrong', function () {
        it('should reply with 500 status code', async function () {
          // given
          sinon.stub(resetPasswordService, 'verifyDemand').rejects(new Error());

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(500);
        });
      });

      context('when temporaryKey is linked to a password reset demand', function () {
        beforeEach(async function () {
          databaseBuilder.factory.buildUser({ email });
          databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

          await databaseBuilder.commit();
        });

        it('should reply with 200 status code', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });

  describe('POST /api/expired-password-updates', function () {
    afterEach(async function () {
      await knex('authentication-methods').delete();
    });

    context('Success cases', function () {
      it('should return 201 HTTP status code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRawPassword({
          shouldChangePassword: true,
        });
        await databaseBuilder.commit();
        const passwordResetToken = tokenService.createPasswordResetToken(user.id);

        const options = {
          method: 'POST',
          url: '/api/expired-password-updates',
          payload: {
            data: {
              attributes: {
                'password-reset-token': passwordResetToken,
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
        it('should respond 403 HTTP status code', async function () {
          // given
          const user = databaseBuilder.factory.buildUser.withRawPassword({
            shouldChangePassword: false,
          });
          await databaseBuilder.commit();
          const passwordResetToken = tokenService.createPasswordResetToken(user.id);

          const options = {
            method: 'POST',
            url: '/api/expired-password-updates',
            payload: {
              data: {
                attributes: {
                  'password-reset-token': passwordResetToken,
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
