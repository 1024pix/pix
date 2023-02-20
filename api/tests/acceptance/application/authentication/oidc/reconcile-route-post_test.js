import { expect, databaseBuilder } from '../../../../test-helper';
import createServer from '../../../../../server';
import jsonwebtoken from 'jsonwebtoken';
import authenticationSessionService from '../../../../../lib/domain/services/authentication/authentication-session-service';
import OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers';

describe('Acceptance | Application | Oidc | Routes', function () {
  describe('POST /api/oidc/user/reconcile', function () {
    let server;

    beforeEach(async function () {
      server = await createServer();
    });

    it('should return 200 HTTP status', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'eva.poree@example.net',
        rawPassword: 'pix123',
      });
      await databaseBuilder.commit();

      const idToken = jsonwebtoken.sign(
        {
          given_name: 'Brice',
          family_name: 'Glace',
          nonce: 'nonce',
          sub: 'some-user-unique-id',
        },
        'secret'
      );
      const userAuthenticationKey = await authenticationSessionService.save({
        sessionContent: { idToken },
        userInfo: {
          userId: user.id,
          firstName: 'Brice',
          lastName: 'Glace',
          nonce: 'nonce',
          externalIdentityId: 'some-user-unique-id',
        },
      });

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/oidc/user/reconcile`,
        payload: {
          data: {
            attributes: {
              identity_provider: OidcIdentityProviders.CNAV.service.code,
              authentication_key: userAuthenticationKey,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result['access_token']).to.exist;
      expect(response.result['logout_url_uuid']).to.be.null;
    });
  });
});
