const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-update-user-details-for-administration', () => {

  let server;
  let user;
  let options;

  beforeEach(async () => {
    server = await createServer();

    user = await insertUserWithRolePixMaster();

  });

  describe('Error case', () => {

    it('should return bad request when payload is not valid', async () => {
      // given
      options = {
        method: 'PATCH',
        url: `/api/admin/users/${user.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            id: user.id,
            attributes: {
              email: 'emailUpdated'
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      const firstError = response.result.errors[0];
      expect(firstError.detail).to.equal('"data.attributes.first-name" is required');
    });

    it('should reply with not authorized error', async () => {
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
              email: 'emailUpdated'
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should reply with forbidden error', async () => {

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
              email: 'emailUpdated@example.net'
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('Success case', () => {

    it('should reply with 200 status code, when user details are updated', async () => {

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
              email: 'emailUpdated@example.net'
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(
        {
          'data': {
            'attributes': {
              'cgu': user.cgu,
              'email': 'emailUpdated@example.net',
              'first-name': 'firstNameUpdated',
              'is-authenticated-from-gar': false,
              'last-name': 'lastNameUpdated',
              'pix-certif-terms-of-service-accepted': user.pixCertifTermsOfServiceAccepted,
              'pix-orga-terms-of-service-accepted': user.pixOrgaTermsOfServiceAccepted,
              'username': null,
            },
            'id': '1234',
            'type': 'users',
          }
        }
      );
    });
  });

});
