const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Route | Users', function () {
  describe('PUT /api/admin/users/{userId}/authentication-methods/{authenticationMethodId}/reassign', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const server = await createServer();
      const pixMaster = await insertUserWithRolePixMaster();
      const originUserId = databaseBuilder.factory.buildUser().id;
      const targetUserId = databaseBuilder.factory.buildUser().id;
      const authenticationMethodId = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      }).id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/admin/users/${originUserId}/authentication-methods/${authenticationMethodId}/reassign`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(pixMaster.id),
        },
        payload: {
          data: {
            attributes: {
              'user-id': targetUserId,
              'identity-provider': AuthenticationMethod.identityProviders.GAR,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
