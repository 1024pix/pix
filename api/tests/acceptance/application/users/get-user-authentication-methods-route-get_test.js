import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Acceptance | Route | Users', function () {
  describe('GET /api/users/{id}/authentication-methods', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const user = databaseBuilder.factory.buildUser({});
      const garAuthenticationMethod = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/users/${user.id}/authentication-methods`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const expectedJson = {
        data: [
          {
            type: 'authentication-methods',
            id: garAuthenticationMethod.id.toString(),
            attributes: {
              'identity-provider': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            },
          },
        ],
      };

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedJson);
    });
  });
});
