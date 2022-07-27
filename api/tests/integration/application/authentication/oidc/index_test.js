const { expect, sinon, generateValidRequestAuthorizationHeader } = require('../../../../test-helper');
const createServer = require('../../../../../server');
const oidcController = require('../../../../../lib/application/authentication/oidc/oidc-controller');

describe('Integration | Application | Route | OidcRouter', function () {
  let server;

  beforeEach(async function () {
    sinon.stub(oidcController, 'getRedirectLogoutUrl').callsFake((request, h) => h.response('ok').code(200));
    server = await createServer();
  });

  describe('GET /api/oidc/redirect-logout-url', function () {
    it('should return a response with HTTP status code 200', async function () {
      // given & when
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/api/oidc/redirect-logout-url?identity_provider=POLE_EMPLOI&logout_url_uuid=b45cb781-4e9a-49b6-8c7e-ff5f02e07720',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      });

      // then
      expect(statusCode).to.equal(200);
    });

    context('when missing required parameters', function () {
      context('all', function () {
        it('should return a response with HTTP status code 400', async function () {
          // given & when
          const { statusCode } = await server.inject({
            method: 'GET',
            url: '/api/oidc/redirect-logout-url',
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('identity_provider', function () {
        it('should return a response with HTTP status code 400', async function () {
          // given & when
          const { statusCode } = await server.inject({
            method: 'GET',
            url: '/api/oidc/redirect-logout-url?logout_url_uuid=b45cb781-4e9a-49b6-8c7e-ff5f02e07720',
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('logout_url_uuid', function () {
        it('should return a response with HTTP status code 400', async function () {
          // given & when
          const { statusCode } = await server.inject({
            method: 'GET',
            url: '/api/oidc/redirect-logout-url?identity_provider=POLE_EMPLOI',
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when identity_provider parameter is not POLE_EMPLOI', function () {
      it('should return a response with HTTP status code 400', async function () {
        // given & when
        const { statusCode } = await server.inject({
          method: 'GET',
          url: '/api/oidc/redirect-logout-url?identity_provider=MY_IDP&logout_url_uuid=b45cb781-4e9a-49b6-8c7e-ff5f02e07720',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        });

        // then
        expect(statusCode).to.equal(400);
      });
    });
  });
});
