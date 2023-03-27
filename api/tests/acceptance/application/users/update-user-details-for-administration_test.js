const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-update-user-details-for-administration', function () {
  let server;
  let user;
  let options;

  beforeEach(async function () {
    server = await createServer();
    user = await insertUserWithRoleSuperAdmin();
  });

  describe('Error case', function () {
    it('should return bad request when payload is not valid', async function () {
      // given
      options = {
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
      options = {
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
      options = {
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

  describe('Success case', function () {
    it('should reply with 200 status code, when user details are updated', async function () {
      // given
      options = {
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
            },
          },
        },
      };
      const authenticationMethod = await knex('authentication-methods').where({ userId: user.id }).first();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            'first-name': 'firstNameUpdated',
            'last-name': 'lastNameUpdated',
            email: 'emailUpdated@example.net',
            username: 'usernameUpdated',
            cgu: user.cgu,
            'pix-certif-terms-of-service-accepted': user.pixCertifTermsOfServiceAccepted,
            'pix-orga-terms-of-service-accepted': user.pixOrgaTermsOfServiceAccepted,
          },
          relationships: {
            'organization-learners': {
              data: [],
            },
            'authentication-methods': {
              data: [
                {
                  id: `${authenticationMethod.id}`,
                  type: 'authenticationMethods',
                },
              ],
            },
          },
          id: '1234',
          type: 'users',
        },
        included: [
          {
            attributes: {
              'identity-provider': `${authenticationMethod.identityProvider}`,
            },
            id: `${authenticationMethod.id}`,
            type: 'authenticationMethods',
          },
        ],
      });
    });
  });
});
