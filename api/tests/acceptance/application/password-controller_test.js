const { databaseBuilder, expect, knex, sinon } = require('../../test-helper');

const resetPasswordService = require('../../../lib/domain/services/reset-password-service');
const resetPasswordDemandRepository = require('../../../lib/infrastructure/repositories/reset-password-demands-repository');

const config = require('../../../lib/config');

const createServer = require('../../../server');

describe('Acceptance | Controller | password-controller', function() {

  const email = 'user@example.net';

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  describe('POST /api/password-reset-demands', function() {

    let options;

    beforeEach(async function() {
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
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({ userId });
      await databaseBuilder.commit();
    });

    afterEach(async function() {
      await knex('reset-password-demands').delete();
    });

    context('when email provided is unknown', function() {

      it('should reply with 404', async function() {
        // given
        options.payload.data.attributes.email = 'unknown@example.net';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when existing email is provided and email is delivered', function() {

      it('should reply with 201', async function() {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when existing email is provided, but some internal error has occured', function() {

      it('should reply with 500', async function() {
        // given
        sinon.stub(resetPasswordDemandRepository, 'create').rejects(new Error());

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(500);
      });
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function() {

    const options = {
      method: 'GET',
      url: null,
    };

    context('when temporaryKey is not valid', function() {

      it('should reply with 401 status code', async function() {
        // given
        options.url = '/api/password-reset-demands/invalid-temporary-key';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when temporaryKey is valid', function() {

      let temporaryKey;

      beforeEach(function() {
        temporaryKey = resetPasswordService.generateTemporaryKey();
        options.url = `/api/password-reset-demands/${temporaryKey}`;
      });

      context('when temporaryKey is not linked to a reset password demand', function() {

        it('should reply with 404 status code', async function() {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when something going wrong', function() {

        it('should reply with 500 status code', async function() {
          // given
          sinon.stub(resetPasswordService, 'verifyDemand').rejects(new Error());

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(500);
        });
      });

      context('when temporaryKey is linked to a password reset demand', function() {

        beforeEach(async function() {
          databaseBuilder.factory.buildUser({ email });
          databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

          await databaseBuilder.commit();
        });

        it('should reply with 200 status code', async function() {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });

  describe('POST /api/expired-password-updates', function() {

    const username = 'firstName.lastName0511';
    const expiredPassword = 'Password01';
    const newPassword = 'Password02';

    const options = {
      method: 'POST',
      url: '/api/expired-password-updates',
      payload: {
        data: {
          attributes: { username, expiredPassword, newPassword },
        },
      },
    };

    beforeEach(async function() {
      databaseBuilder.factory.buildUser.withRawPassword({
        username,
        rawPassword: expiredPassword,
        shouldChangePassword: true,
      });
      await databaseBuilder.commit();
    });

    afterEach(async function() {
      await knex('authentication-methods').delete();
    });

    context('Success cases', function() {

      it('should return 201 HTTP status code', async function() {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', function() {

      context('when username does not exist', function() {

        it('should respond 404 HTTP status code', async function() {
          // given
          options.payload.data.attributes = { username: 'unknow', expiredPassword, newPassword };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when password is invalid', function() {

        it('should respond 401 HTTP status code', async function() {
          // given
          options.payload.data.attributes = { username, expiredPassword: 'wrongPassword01', newPassword };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('when shoulChangePassword is false', function() {

        it('should respond 403 HTTP status code', async function() {
          // given
          const username = 'jean.oubliejamais0105';
          databaseBuilder.factory.buildUser.withRawPassword({
            username,
            rawPassword: expiredPassword,
            shouldChangePassword: false,
          });

          options.payload.data.attributes = { username, expiredPassword, newPassword };

          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

});
