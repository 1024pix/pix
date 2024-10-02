import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Acceptance | Identity Access Management | Application | Route | Admin | User', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /admin/users/:id/unblock', function () {
    it('unblocks user how has tried to many wrong password', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const userLoginId = databaseBuilder.factory.buildUserLogin({ userId }).id;
      const superAdmin = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/admin/users/${userId}/unblock`,
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data.id).to.equal(`${userLoginId}`);
      expect(response.result.data.type).to.equal('user-logins');

      expect(response.result.data.attributes['user-id']).to.equal(userId);
      expect(response.result.data.attributes['failure-count']).to.equal(0);
      expect(response.result.data.attributes['temporary-blocked-until']).to.be.null;
      expect(response.result.data.attributes['blocked-at']).to.be.null;
    });
  });

  describe('GET /api/admin/users', function () {
    context('When filters match a list of users', function () {
      let requestOptions;

      beforeEach(async function () {
        const user = await insertUserWithRoleSuperAdmin();
        const params = '?filter[firstName]=Ann' + '&page[number]=1&page[size]=25';

        requestOptions = {
          method: 'GET',
          url: `/api/admin/users${params}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        await databaseBuilder.factory.buildUser({ firstName: 'Ann' });
        await databaseBuilder.factory.buildUser({ firstName: 'Anne' });
        await databaseBuilder.factory.buildUser({ firstName: 'Annie' });
        await databaseBuilder.commit();
      });

      it('retrieves this list of users', async function () {
        // when
        const response = await server.inject(requestOptions);
        // then
        const { result, statusCode } = response;
        expect(statusCode).to.equal(200);
        expect(result.data).to.have.length(3);
      });
    });
  });

  describe('PATCH /api/admin/users', function () {
    let user;

    beforeEach(async function () {
      user = await insertUserWithRoleSuperAdmin();
    });

    it('should reply with 200 status code, when user details are updated', async function () {
      // given
      const options = {
        method: 'PATCH',
        url: `/api/admin/users/${user.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            id: user.id,
            attributes: {
              'first-name': 'firstNameUpdated',
              'last-name': 'lastNameUpdated',
              email: 'emailUpdated@example.net',
              username: 'usernameUpdated',
              lang: 'en',
              locale: 'fr-FR',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal('1234');
      expect(response.result.data.type).to.equal('users');
      expect(response.result.data.attributes.email).to.equal('emailUpdated@example.net');
      expect(response.result.data.relationships['organization-learners']).to.not.be.undefined;
      expect(response.result.data.relationships['authentication-methods']).to.not.be.undefined;
    });

    describe('Error case', function () {
      it('should return bad request when payload is not valid', async function () {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/admin/users/${user.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              id: user.id,
              attributes: {
                email: 'emailUpdated',
                lang: 'pt',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        const firstError = response.result.errors[0];
        expect(firstError.detail).to.equal('"data.attributes.first-name" is required');
      });

      it('should reply with not authorized error', async function () {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/admin/users/${user.id}`,
          payload: {
            data: {
              id: user.id,
              attributes: {
                firstName: 'firstNameUpdated',
                lastName: 'lastNameUpdated',
                email: 'emailUpdated',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should reply with forbidden error', async function () {
        user = databaseBuilder.factory.buildUser({ email: 'partial.update@example.net' });
        await databaseBuilder.commit();

        // given
        const options = {
          method: 'PATCH',
          url: `/api/admin/users/${user.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              id: user.id,
              attributes: {
                'first-name': 'firstNameUpdated',
                'last-name': 'lastNameUpdated',
                email: 'emailUpdated@example.net',
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
