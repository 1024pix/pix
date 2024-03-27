import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import * as fetch from 'fetch';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Authenticator | oidc', function (hooks) {
  setupTest(hooks);

  module('#authenticate', function (hooks) {
    const userId = 1;
    const source = 'oidc-externe';
    const useEndSession = false;
    const shouldCloseSession = true;
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
          code,
          redirect_uri: redirectUri,
          state,
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

    hooks.beforeEach(function () {
      sinon.stub(fetch, 'default').resolves({
        json: sinon.stub().resolves({ access_token: accessToken, logout_url_uuid: logoutUrlUuid }),
        ok: true,
      });
      const oidcPartner = {
        id: identityProviderSlug,
        code: identityProviderCode,
        organizationName: 'Partenaire OIDC',
        useEndSession,
        shouldCloseSession,
        source,
      };
      class OidcIdentityProvidersStub extends Service {
        [identityProviderSlug] = oidcPartner;
        list = [oidcPartner];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    test('should fetch token with authentication key', async function (assert) {
      // given
      const authenticator = this.owner.lookup('authenticator:oidc');

      // when
      const token = await authenticator.authenticate({
        identityProviderSlug,
        authenticationKey: 'key',
        hostSlug: 'users',
      });

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
      assert.deepEqual(token, {
        access_token: accessToken,
        logoutUrlUuid,
        source,
        shouldCloseSession,
        useEndSession,
        user_id: userId,
        identityProviderCode,
      });
    });

    test('should fetch token with code, redirectUri, and state in body', async function (assert) {
      // given
      const authenticator = this.owner.lookup('authenticator:oidc');

      // when
      const token = await authenticator.authenticate({
        code,
        redirectUri,
        state,
        identityProviderSlug,
        hostSlug: 'token',
      });

      // then
      request.body = body;
      sinon.assert.calledWith(fetch.default, 'http://localhost:3000/api/oidc/token', request);
      assert.deepEqual(token, {
        access_token: accessToken,
        logoutUrlUuid,
        source,
        useEndSession,
        shouldCloseSession,
        user_id: userId,
        identityProviderCode,
      });
    });

    module('when user is authenticated', function () {
      test('should invalidate session', async function (assert) {
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

        const authenticator = this.owner.lookup('authenticator:oidc');
        authenticator.session = sessionStub;

        // when
        await authenticator.authenticate({ code, redirectUri, state, identityProviderSlug, hostSlug: 'token' });

        // then
        request.body = body;
        sinon.assert.calledWith(fetch.default, `http://localhost:3000/api/oidc/token`, request);
        sinon.assert.calledOnce(sessionStub.invalidate);
        assert.ok(true);
      });
    });
  });

  module('#invalidate', function () {
    module('when user has logout url in their session', function () {
      test('should set alternativeRootURL with the redirect logout url', async function (assert) {
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
          shouldCloseSession: true,
          identityProviderCode: 'OIDC_PARTNER',
          logoutUrlUuid: 'uuid',
        });

        // then
        assert.strictEqual(authenticator.session.alternativeRootURL, redirectLogoutUrl);
        sinon.restore();
      });
    });
  });
});
