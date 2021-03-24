const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, sinon } = require('../../../test-helper');
const createServer = require('../../../../server');
const mailer = require('../../../../lib/infrastructure/mailers/mailer');

describe('Acceptance | Controller | users-controller', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  describe('PATCH /api/users/{id}/email', function() {

    context('user is valid', function() {

      let user;
      const password = 'password123';

      beforeEach(async function() {
        user = databaseBuilder.factory.buildUser.withRawPassword({
          email: 'old_email@example.net',
          rawPassword: password,
        });
        await databaseBuilder.commit();

      });

      afterEach(async function() {
        await databaseBuilder.clean();
      });

      context('user is valid', function() {

        let response;
        beforeEach(async function() {
          sinon.stub(mailer, 'sendEmail');
          // given
          const options = {
            method: 'PATCH',
            url: `/api/users/${user.id}/email`,
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
            payload: {
              data: {
                type: 'users',
                attributes: {
                  'email': 'new_email@example.net',
                  'password': password,
                },
              },
            },
          };

          // when
          response = await server.inject(options);
        });

        it('should return status 204 with user', async function() {
          // then
          expect(response.statusCode).to.equal(204);
        });

        it('should notify user by email', async function() {
          // then
          expect(mailer.sendEmail).to.have.been.called;
        });

      });

      it('should return 403 if account is not his own', async function() {
        // given
        const wrongUserId = user.id - 1;

        const options = {
          method: 'PATCH',
          url: `/api/users/${user.id}/email`,
          headers: { authorization: generateValidRequestAuthorizationHeader(wrongUserId) },
          payload: {
            data: {
              type: 'users',
              attributes: {
                'email': 'new_email@example.net',
                'password': password,
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return 403 if user has no email', async function() {
        // given
        const userWithoutEmail = databaseBuilder.factory.buildUser({ email: null });

        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/users/${userWithoutEmail.id}/email`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userWithoutEmail.id) },
          payload: {
            data: {
              type: 'users',
              attributes: {
                'email': 'new_email@example.net',
                'password': password,
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return 400 if password does not match', async function() {

        // given
        user = databaseBuilder.factory.buildUser.withRawPassword({
          email: 'john.doe@example.net',
          rawPassword: password,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/users/${user.id}/email`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'users',
              attributes: {
                'email': 'new_email@example.net',
                'password': 'foo',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
