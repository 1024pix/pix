const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster,
} = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-dissociate-schooling-registrations-by-user', function() {

  let server;
  let user;
  let options;

  beforeEach(async function() {
    server = await createServer();
    user = databaseBuilder.factory.buildUser({ samlId: null });
    const pixMaster = await insertUserWithRolePixMaster();
    options = {
      headers: { authorization: generateValidRequestAuthorizationHeader(pixMaster.id) },
      method: 'PATCH',
      url: `/api/admin/users/${user.id}/dissociate`,
    };

    await databaseBuilder.commit();
  });

  describe('PATCH /admin/users/:id/dissociate', function() {

    it('should return 200', async function() {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should dissociate and return updated user', async function() {
      // given
      const expectedUpdatedUserDetailsForAdmin = {
        type: 'users',
        id: user.id.toString(),
        attributes: {
          'first-name': user.firstName,
          'last-name': user.lastName,
          'email': user.email,
          'username': user.username,
          'cgu': user.cgu,
          'pix-orga-terms-of-service-accepted': user.pixOrgaTermsOfServiceAccepted,
          'pix-certif-terms-of-service-accepted': user.pixCertifTermsOfServiceAccepted,
          'is-authenticated-from-gar': false,
        },
        'relationships': {
          'schooling-registrations': {
            'data': [],
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data).to.deep.equal(expectedUpdatedUserDetailsForAdmin);
    });
  });
});
