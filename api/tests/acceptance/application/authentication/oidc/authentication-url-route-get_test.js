import querystring from 'querystring';

import { createServer, expect } from '../../../../test-helper.js';

describe('Acceptance | Route | oidc authentication url', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/oidc/authentication-url', function () {
    context('When the request returns 200', function () {
      it('returns the authentication url', async function () {
        // given
        const query = querystring.stringify({
          identity_provider: 'OIDC_EXAMPLE_NET',
          redirect_uri: 'https://app.dev.pix.org/connexion/oidc-example-net',
        });

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/oidc/authentication-url?${query}`,
        });

        // then
        expect(response.statusCode).to.equal(200);

        const redirectTargetUrl = new URL(response.result.redirectTarget);

        expect(redirectTargetUrl.origin).to.equal('https://oidc.example.net');
        expect(redirectTargetUrl.pathname).to.equal('/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/authorize');
        expect(redirectTargetUrl.searchParams.get('redirect_uri')).to.equal(
          'https://app.dev.pix.org/connexion/oidc-example-net',
        );
        expect(redirectTargetUrl.searchParams.get('client_id')).to.equal('client');
        expect(redirectTargetUrl.searchParams.get('response_type')).to.equal('code');
        expect(redirectTargetUrl.searchParams.get('scope')).to.equal('openid profile');
      });
    });
  });
});
