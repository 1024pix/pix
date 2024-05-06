import {
  createServer,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';

describe('Acceptance | Identity Access Management | Route | Oidc', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/oidc-providers/import', function () {
    it('imports oidc providers and returns an HTTP status code 204', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const payload = [
        {
          accessTokenLifespan: '7d',
          claimsToStore: 'email',
          clientId: 'client-id-aqwzsxedcrfvtgbyhnuj,ikolp',
          clientSecret: 'client-secret-azertyuiopqsdfghjklmwxcvbn',
          enabled: false,
          enabledForPixAdmin: true,
          identityProvider: 'GOOGLE',
          openidConfigurationUrl: 'https://accounts.google.com/.well-known/openid-configuration',
          organizationName: 'Google',
          redirectUri: 'https://redirect.uri/',
          scope: 'openid profile email',
          slug: 'google',
          source: 'google',
        },
      ];
      const options = {
        method: 'POST',
        url: '/api/admin/oidc-providers/import',
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const oidcProviders = await knex('oidc-providers').select();
      expect(oidcProviders).to.have.lengthOf(1);
    });
  });

  describe('GET /api/admin/oidc/identity-providers', function () {
    it('returns the list of all oidc providers with an HTTP status code 200', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/oidc/identity-providers',
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
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
            'should-close-session': true,
            source: 'oidcexamplenet',
          },
        },
      ]);
    });
  });
});
