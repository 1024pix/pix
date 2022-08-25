import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import * as fetch from 'fetch';

describe('Unit | Authenticator | oidc', function () {
  setupTest();

  describe('#authenticate', function () {
    const userId = 1;
    const source = 'oidc-externe';
    const hasLogoutUrl = true;
    const logoutUrlUuid = 'uuid';
    const identityProviderCode = 'OIDC_PARTNER';
    const identityProviderSlug = 'oidc-partner';
    const code = 'code';
    const redirectUri = 'redirectUri';
    const state = 'state';
    const request = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const body = JSON.stringify({
      data: {
        attributes: {
          identity_provider: identityProviderCode,
          code: code,
          redirect_uri: redirectUri,
          state_sent: undefined,
          state_received: state,
        },
      },
    });
    const accessToken =
      'aaa.' +
      btoa(`{
        "user_id": ${userId},
        "source": "${source}",
        "identity_provider": "${identityProviderCode}",
        "iat": 1545321469,
        "exp": 4702193958
      }`) +
      '.bbb';

    beforeEach(function () {
      sinon.stub(fetch, 'default').resolves({
        json: sinon.stub().resolves({ access_token: accessToken, logout_url_uuid: logoutUrlUuid }),
        ok: true,
      });
      const oidcPartner = {
        id: identityProviderSlug,
        code: identityProviderCode,
        organizationName: 'Partenaire OIDC',
        hasLogoutUrl,
        source,
      };
      class OidcIdentityProvidersStub extends Service {
        [identityProviderSlug] = oidcPartner;
        list = [oidcPartner];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should fetch token with authentication key', async function () {
      // given
      const authenticator = this.owner.lookup('authenticator:oidc');

      // when
      const token = await authenticator.authenticate({ identityProviderSlug, authenticationKey: 'key' });

      // then
      request.body = JSON.stringify({
        data: {
          attributes: {
            identity_provider: identityProviderCode,
            authentication_key: 'key',
          },
        },
      });
      sinon.assert.calledWith(fetch.default, `http://localhost:3000/api/oidc/users`, request);
      expect(token).to.deep.equal({
        access_token: accessToken,
        logoutUrlUuid,
        source,
        hasLogoutUrl,
        user_id: userId,
        identityProviderCode,
      });
    });

    it('should fetch token with code, redirectUri, and state in body', async function () {
      // given
      const authenticator = this.owner.lookup('authenticator:oidc');

      // when
      const token = await authenticator.authenticate({ code, redirectUri, state, identityProviderSlug });

      // then
      request.body = body;
      sinon.assert.calledWith(fetch.default, 'http://localhost:3000/api/oidc/token', request);
      expect(token).to.deep.equal({
        access_token: accessToken,
        logoutUrlUuid,
        source,
        hasLogoutUrl,
        user_id: userId,
        identityProviderCode,
      });
    });

    context('when user is authenticated', function () {
      it('should pass the access token in the header authorization', async function () {
        // given
        const sessionStub = Service.create({
          isAuthenticated: true,
          invalidate: sinon.stub(),
          data: {
            authenticated: {
              logoutUrlUuid,
              access_token: accessToken,
            },
          },
        });
        const featureTogglesStub = Service.create({
          featureToggles: {
            isSsoAccountReconciliationEnabled: false,
          },
        });

        const authenticator = this.owner.lookup('authenticator:oidc');
        authenticator.session = sessionStub;
        authenticator.featureToggles = featureTogglesStub;

        // when
        const token = await authenticator.authenticate({ code, redirectUri, state, identityProviderSlug });

        // then
        request.headers['Authorization'] = `Bearer ${accessToken}`;
        request.body = body;
        sinon.assert.calledWith(fetch.default, `http://localhost:3000/api/oidc/token`, request);
        sinon.assert.calledOnce(sessionStub.invalidate);
        expect(token).to.deep.equal({
          access_token: accessToken,
          logoutUrlUuid,
          source,
          hasLogoutUrl,
          user_id: userId,
          identityProviderCode,
        });
      });

      context('when sso account reconciliation is enabled', function () {
        it('should only invalidate session', async function () {
          // given
          const sessionStub = Service.create({
            isAuthenticated: true,
            invalidate: sinon.stub(),
            data: {
              authenticated: {
                logoutUrlUuid,
                access_token: accessToken,
              },
            },
          });
          const featureTogglesStub = Service.create({
            featureToggles: {
              isSsoAccountReconciliationEnabled: true,
            },
          });

          const authenticator = this.owner.lookup('authenticator:oidc');
          authenticator.session = sessionStub;
          authenticator.featureToggles = featureTogglesStub;

          // when
          await authenticator.authenticate({ code, redirectUri, state, identityProviderSlug });

          // then
          delete request.headers['Authorization'];
          request.body = body;
          sinon.assert.calledWith(fetch.default, `http://localhost:3000/api/oidc/token`, request);
          sinon.assert.calledOnce(sessionStub.invalidate);
        });
      });
    });
  });

  describe('#invalidate', function () {
    context('when user has logout url in their session', function () {
      it('should set alternativeRootURL with the redirect logout url', async function () {
        // given
        const sessionStub = Service.create({
          isAuthenticated: true,
          data: {
            authenticated: {
              logout_url_uuid: 'uuid',
            },
          },
        });
        const authenticator = this.owner.lookup('authenticator:oidc');
        authenticator.session = sessionStub;
        const redirectLogoutUrl =
          'http://identity_provider_base_url/deconnexion?id_token_hint=ID_TOKEN&redirect_uri=http%3A%2F%2Flocalhost.fr%3A4200%2Fconnexion';
        sinon.stub(fetch, 'default').resolves({
          json: sinon.stub().resolves({ redirectLogoutUrl }),
        });

        // when
        await authenticator.invalidate({
          hasLogoutUrl: true,
          identityProviderCode: 'OIDC_PARTNER',
          logoutUrlUuid: 'uuid',
        });

        // then
        expect(authenticator.session.alternativeRootURL).to.equal(redirectLogoutUrl);
        sinon.restore();
      });
    });
  });
});
