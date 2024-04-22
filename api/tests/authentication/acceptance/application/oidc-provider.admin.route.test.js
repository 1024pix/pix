import {
  createServer,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';

describe('Acceptance | Authentication | Route | Oidc', function () {
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
      const server = await createServer();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const oidcProviders = await knex('oidc-providers').select();
      expect(oidcProviders).to.have.lengthOf(1);
    });
  });
});
