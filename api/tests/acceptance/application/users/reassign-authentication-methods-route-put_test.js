import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';

describe('Acceptance | Route | Users', function () {
  describe('POST /api/admin/users/{userId}/authentication-methods/{authenticationMethodId}', function () {
    let server;
    let superAdmin;

    beforeEach(async function () {
      server = await createServer();
      superAdmin = await insertUserWithRoleSuperAdmin();
    });

    it('should return 204 HTTP status code', async function () {
      // given
      const originUserId = databaseBuilder.factory.buildUser().id;
      const targetUserId = databaseBuilder.factory.buildUser().id;
      const authenticationMethodId = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      }).id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${originUserId}/authentication-methods/${authenticationMethodId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        payload: {
          data: {
            attributes: {
              'user-id': targetUserId,
              'identity-provider': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 422 HTTP status code when target user has already a GAR authentication method', async function () {
      // given
      const originUserId = databaseBuilder.factory.buildUser().id;
      const targetUserId = databaseBuilder.factory.buildUser().id;
      const authenticationMethodId = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      }).id;

      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: targetUserId,
        externalIdentifier: 'externalId2',
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${originUserId}/authentication-methods/${authenticationMethodId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        payload: {
          data: {
            attributes: {
              'user-id': targetUserId,
              'identity-provider': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.result.errors[0].detail).to.equal(
        `L'utilisateur ${targetUserId} a déjà une méthode de connexion GAR.`
      );
    });
  });
});
