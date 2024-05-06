import { createServer, expect } from '../../../test-helper.js';

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
});
