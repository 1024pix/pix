import { expect, databaseBuilder, knex } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import jsonwebtoken from 'jsonwebtoken';
import * as authenticationSessionService from '../../../../../lib/domain/services/authentication/authentication-session-service.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';

describe('Acceptance | Application | Oidc | Routes', function () {
  describe('POST /api/admin/oidc/user/reconcile', function () {
    let server;

    beforeEach(async function () {
      server = await createServer();
    });

    afterEach(async function () {
      await knex('user-logins').delete();
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
        'secret',
      );
      const userAuthenticationKey = await authenticationSessionService.save({
        sessionContent: { idToken },
        userInfo: {
          firstName: 'Brice',
          lastName: 'Glace',
          nonce: 'nonce',
          externalIdentityId: 'some-user-unique-id',
        },
      });

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/oidc/user/reconcile`,
        payload: {
          data: {
            attributes: {
              identity_provider: OidcIdentityProviders.CNAV.code,
              authentication_key: userAuthenticationKey,
              email: user.email,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result['access_token']).to.exist;
    });
  });
});
