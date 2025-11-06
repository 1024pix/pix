import jsonwebtoken from 'jsonwebtoken';

import { authenticationSessionService } from '../../../../src/identity-access-management/domain/services/authentication-session.service.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';
import { createMockedTestOidcProvider } from '../../../tooling/openid-client/openid-client-mocks.js';

describe('Acceptance | Identity Access Management | Route | Admin | oidc-provider', function () {
  let server;

  beforeEach(async function () {
    await createMockedTestOidcProvider({ application: 'admin', applicationTld: '.fr' });
    server = await createServer();
  });

  describe('POST /api/admin/oidc-providers/import', function () {
    it('imports oidc providers and returns an HTTP status code 204', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const payload = [
        {
          application: 'orga',
          applicationTld: '.org',
          accessTokenLifespan: '7d',
          claimsToStore: 'email',
          clientId: 'client-id-aqwzsxedcrfvtgbyhnuj-ikolp',
          clientSecret: 'client-secret-azertyuiopqsdfghjklmwxcvbn',
          enabled: false,
          enabledForPixAdmin: true,
          identityProvider: 'GOOGLE-ORGA',
          openidConfigurationUrl: 'https://accounts.google.com/.well-known/openid-configuration',
          organizationName: 'Google',
          redirectUri: 'https://redirect.uri/',
          scope: 'openid profile email',
          slug: 'google',
          source: 'google',
          isVisible: true,
          connectionMethodCode: 'GOOGLE',
        },
      ];
      const options = {
        method: 'POST',
        url: '/api/admin/oidc-providers/import',
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const oidcProviders = await knex('oidc-providers').select();
      expect(oidcProviders).to.have.lengthOf(1);
      expect(oidcProviders[0]).to.contain({
        application: 'orga',
        applicationTld: '.org',
        accessTokenLifespan: '7d',
        claimsToStore: 'email',
        clientId: 'client-id-aqwzsxedcrfvtgbyhnuj-ikolp',
        enabled: false,
        enabledForPixAdmin: true,
        identityProvider: 'GOOGLE-ORGA',
        openidConfigurationUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        organizationName: 'Google',
        redirectUri: 'https://redirect.uri/',
        scope: 'openid profile email',
        slug: 'google',
        source: 'google',
        isVisible: true,
        connectionMethodCode: 'GOOGLE',
      });
    });
  });

  describe('GET /api/admin/oidc/identity-providers', function () {
    it('returns the list of all oidc providers with an HTTP status code 200', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/oidc/identity-providers',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'oidc-identity-providers',
          id: 'oidc-example-net',
          attributes: {
            code: 'OIDC_EXAMPLE_NET',
            'organization-name': 'OIDC Example',
            slug: 'oidc-example-net',
            'should-close-session': true,
            source: 'oidcexamplenet',
            'is-visible': true,
          },
        },
      ]);
    });
  });

  describe('POST /api/admin/oidc/user/reconcile', function () {
    it('returns 200 HTTP status code', async function () {
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
          sub: 'some-user-unique-id',
        },
        'secret',
      );
      const userAuthenticationKey = await authenticationSessionService.save({
        sessionContent: { idToken },
        userInfo: {
          firstName: 'Brice',
          lastName: 'Glace',
          externalIdentityId: 'some-user-unique-id',
        },
      });

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/oidc/user/reconcile`,
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'admin.pix.fr',
        },
        payload: {
          data: {
            attributes: {
              identity_provider: 'OIDC_EXAMPLE_NET',
              authentication_key: userAuthenticationKey,
              email: user.email,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.access_token).to.exist;
      const decodedAccessToken = tokenService.getDecodedToken(response.result.access_token);
      expect(decodedAccessToken).to.include({
        aud: 'https://admin.pix.fr',
      });
    });
  });
});
