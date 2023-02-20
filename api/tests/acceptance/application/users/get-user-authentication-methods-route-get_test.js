import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';
import createServer from '../../../../server';

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
              'identity-provider': AuthenticationMethod.identityProviders.GAR,
            },
          },
        ],
      };

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedJson);
    });
  });
});
