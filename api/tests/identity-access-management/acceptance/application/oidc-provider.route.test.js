import { createServer, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';

describe('Acceptance | Identity Access Management | Application | Route | oidc-provider', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/oidc/identity-providers', function () {
    it('returns the list of all oidc providers with an HTTP status code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/oidc/identity-providers',
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

  describe('GET /api/oidc/redirect-logout-url', function () {
    it('returns an object which contains the redirect logout url with HTTP status code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/oidc/redirect-logout-url?identity_provider=OIDC_EXAMPLE_NET&logout_url_uuid=86e1338f-304c-41a8-9472-89fe1b9748a1',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.redirectLogoutUrl).to.equal(
        'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/logout?client_id=client',
      );
    });
  });
});
