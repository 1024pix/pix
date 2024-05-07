import { oidcProviderController } from '../../../../src/identity-access-management/application/oidc-provider.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | oidc-provider', function () {
  describe('#getAuthorizationUrl', function () {
    it('returns the generated authorization url', async function () {
      // given
      const request = {
        query: { identity_provider: 'OIDC' },
        yar: { set: sinon.stub(), commit: sinon.stub() },
      };
      sinon.stub(usecases, 'getAuthorizationUrl').resolves({
        nonce: 'cf5d60f7-f0dc-4d9f-a9e5-11b5eebe5fda',
        state: '0498cd9d-7af3-474d-bde2-946f747ce46d',
        redirectTarget: 'https://idp.net/oidc/authorization',
      });

      // when
      const response = await oidcProviderController.getAuthorizationUrl(request, hFake);

      //then
      expect(usecases.getAuthorizationUrl).to.have.been.calledWithExactly({
        audience: undefined,
        identityProvider: 'OIDC',
      });
      expect(request.yar.set).to.have.been.calledTwice;
      expect(request.yar.set.getCall(0)).to.have.been.calledWithExactly(
        'state',
        '0498cd9d-7af3-474d-bde2-946f747ce46d',
      );
      expect(request.yar.set.getCall(1)).to.have.been.calledWithExactly(
        'nonce',
        'cf5d60f7-f0dc-4d9f-a9e5-11b5eebe5fda',
      );
      expect(request.yar.commit).to.have.been.calledOnce;
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal({
        redirectTarget: 'https://idp.net/oidc/authorization',
      });
    });
  });

  describe('#getIdentityProviders', function () {
    it('returns the list of oidc identity providers', async function () {
      // given
      sinon.stub(usecases, 'getReadyIdentityProviders').returns([
        {
          code: 'SOME_OIDC_PROVIDER',
          source: 'some_oidc_provider',
          organizationName: 'Some OIDC Provider',
          slug: 'some-oidc-provider',
          shouldCloseSession: false,
        },
      ]);

      // when
      const response = await oidcProviderController.getIdentityProviders({ query: { audience: null } }, hFake);

      // then
      expect(usecases.getReadyIdentityProviders).to.have.been.called;
      expect(response.statusCode).to.equal(200);
      expect(response.source.data.length).to.equal(1);
      expect(response.source.data).to.deep.contain({
        type: 'oidc-identity-providers',
        id: 'some-oidc-provider',
        attributes: {
          code: 'SOME_OIDC_PROVIDER',
          source: 'some_oidc_provider',
          'organization-name': 'Some OIDC Provider',
          'should-close-session': false,
        },
      });
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    it('calls the oidc authentication service retrieved from his code to generate the redirect logout url', async function () {
      // given
      const request = {
        auth: { credentials: { userId: '123' } },
        query: {
          identity_provider: 'OIDC',
          logout_url_uuid: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
        },
      };

      sinon.stub(usecases, 'getRedirectLogoutUrl').resolves('https://idp.net/oidc/logout?id_token_hint=ID_TOKEN');

      // when
      const response = await oidcProviderController.getRedirectLogoutUrl(request, hFake);

      // then
      expect(usecases.getRedirectLogoutUrl).to.have.been.calledWithExactly({
        identityProvider: 'OIDC',
        logoutUrlUUID: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
        userId: '123',
      });
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal({
        redirectLogoutUrl: 'https://idp.net/oidc/logout?id_token_hint=ID_TOKEN',
      });
    });
  });
});
