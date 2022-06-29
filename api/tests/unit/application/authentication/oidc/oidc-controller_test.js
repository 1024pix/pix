const { sinon, expect, hFake } = require('../../../../test-helper');
const authenticationServiceRegistry = require('../../../../../lib/domain/services/authentication/authentication-service-registry');
const oidcController = require('../../../../../lib/application/authentication/oidc/oidc-controller');

describe('Unit | Application | Controller | Authentication | OIDC', function () {
  describe('#getRedirectLogoutUrl', function () {
    context('when identity provider is POLE_EMPLOI', function () {
      it('should call pole emploi authentication service to generate the redirect logout url', async function () {
        // given
        const request = {
          auth: { credentials: { userId: '123' } },
          query: {
            identity_provider: 'POLE_EMPLOI',
            redirect_uri: 'http://example.net/',
            logout_url_uuid: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
          },
        };
        const authenticationService = {
          getRedirectLogoutUrl: sinon.stub(),
        };
        authenticationService.getRedirectLogoutUrl
          .withArgs({
            userId: '123',
            logoutUrlUUID: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
            redirectUri: 'http://example.net/',
          })
          .resolves(
            'http://logoutUrl.fr/id_token_hint=ID_TOKEN_HINT&redirect_uri=' + encodeURIComponent('http://example.net/')
          );
        sinon
          .stub(authenticationServiceRegistry, 'lookupAuthenticationService')
          .withArgs('POLE_EMPLOI')
          .returns({ authenticationService });

        // when
        await oidcController.getRedirectLogoutUrl(request, hFake);

        // then
        expect(authenticationServiceRegistry.lookupAuthenticationService).to.have.been.calledWith('POLE_EMPLOI');
        expect(authenticationService.getRedirectLogoutUrl).to.have.been.calledWith({
          userId: '123',
          logoutUrlUUID: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
          redirectUri: 'http://example.net/',
        });
      });
    });
  });
});
