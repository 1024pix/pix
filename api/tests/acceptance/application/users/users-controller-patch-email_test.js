const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const { featureToggles } = require('../../../../lib/config');

describe('Acceptance | Controller | users-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('PATCH /api/users/{id}/email', () => {

    context('user is valid', () => {

      let user;

      beforeEach(async () => {
        featureToggles.myAccount = true;

        user = databaseBuilder.factory.buildUser({
          email: 'old_email@example.net',
        });

        await databaseBuilder.commit();
      });

      it('should return status 204 with user', async () => {
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
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should return 403 if account is not his own', async () => {
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
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return 403 if user has no email', async () => {
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
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return 404 if FT_MY_ACCOUNT is not enabled', async () => {
        // given
        featureToggles.myAccount = false;

        const options = {
          method: 'PATCH',
          url: `/api/users/${user.id}/email`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'users',
              attributes: {
                'email': 'new_email@example.net',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
