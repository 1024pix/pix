const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster,
} = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-dissociate-schooling-registrations-by-user', () => {

  let server;
  let user;
  let options;

  beforeEach(async () => {
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

  describe('PATCH /admin/users/:id/dissociate', () => {

    it('should return 200', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should dissociate and return updated user', async () => {
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
        },
        'relationships': {
          'schooling-registrations': {
            'data': [],
          },
          'authentication-methods': {
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
