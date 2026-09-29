import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Authenticator | oidc', function (hooks) {
  setupTest(hooks);

  module('#authenticate', function (hooks) {
    const userId = 1;
    const source = 'oidc-externe';
    const identityProviderCode = 'OIDC_PARTNER';
    const identityProviderSlug = 'oidc-partner';
    const code = 'code';
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
      sinon.stub(window, 'fetch').resolves({
        json: sinon.stub().resolves({ access_token: accessToken }),
        ok: true,
      });
      const oidcPartner = {
        id: identityProviderCode,
        code: identityProviderCode,
        slug: identityProviderSlug,
        organizationName: 'Partenaire OIDC',
        source,
      };
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      const storeStub = Service.create({
        findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
        peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
      });
      oidcIdentityProvidersService.set('store', storeStub);
    });

    test('fetches token with authentication key', async function (assert) {
      // given
      const authenticator = this.owner.lookup('authenticator:oidc');

      // when
      const token = await authenticator.authenticate({
        identityProviderSlug,
        authenticationKey: 'key',
        email: 'user@example.net',
      });

      // then
      request.body = JSON.stringify({
        data: {
          attributes: {
            identity_provider: identityProviderCode,
            authentication_key: 'key',
            email: 'user@example.net',
          },
        },
      });
      sinon.assert.calledWith(window.fetch, `http://localhost:3000/api/admin/oidc/user/reconcile`, request);
      assert.deepEqual(token, {
        access_token: accessToken,
        user_id: userId,
        expiresAt: 4702193958000,
        source,
        identityProviderCode,
        shouldCloseSession: undefined,
        logoutUrlUuid: undefined,
      });
      assert.ok(true);
    });

    test('fetches token with code and state in body', async function (assert) {
      // given
      const authenticator = this.owner.lookup('authenticator:oidc');

      // when
      const token = await authenticator.authenticate({
        code,
        state,
        identityProviderSlug,
      });

      // then
      request.body = body;
      sinon.assert.calledWith(window.fetch, 'http://localhost:3000/api/oidc/token', request);
      assert.deepEqual(token, {
        access_token: accessToken,
        user_id: userId,
        expiresAt: 4702193958000,
        source,
        identityProviderCode,
        shouldCloseSession: undefined,
        logoutUrlUuid: undefined,
      });
      assert.ok(true);
    });

    module('when user is authenticated', function () {
      test('invalidates session', async function (assert) {
        // given
        const sessionStub = Service.create({
          isAuthenticated: true,
          invalidate: sinon.stub(),
          data: {
            authenticated: {
              access_token: accessToken,
            },
          },
        });

        const authenticator = this.owner.lookup('authenticator:oidc');
        authenticator.session = sessionStub;

        // when
        await authenticator.authenticate({ code, state, identityProviderSlug });

        // then
        request.body = body;
        sinon.assert.calledWith(window.fetch, `http://localhost:3000/api/oidc/token`, request);
        sinon.assert.calledOnce(sessionStub.invalidate);
        assert.ok(true);
      });
    });
  });

  module('restore', function () {
    module('when there is no access_token', function () {
      test('it rejects', async function (assert) {
        // given
        const authenticator = this.owner.lookup('authenticator:oidc');
        const data = {};

        // when & then
        await assert.rejects(authenticator.restore(data));
      });
    });

    module('when there is an access_token', function () {
      module('when the access_token is expired', function () {
        test('it rejects', async function (assert) {
          // given
          const authenticator = this.owner.lookup('authenticator:oidc');
          const data = { expiresAt: new Date().getTime(), access_token: 'accessTokenData' };

          // when & then
          await assert.rejects(authenticator.restore(data));
        });
      });

      module('when the access_token is not expired', function () {
        test('it returns the still valid data', async function (assert) {
          // given
          const authenticator = this.owner.lookup('authenticator:oidc');
          const data = { expiresAt: new Date().getTime() + 60000, access_token: 'accessTokenData' };

          // when
          const result = await authenticator.restore(data);

          // then
          assert.strictEqual(result, data);
        });
      });
    });
  });

  module('#invalidate', function () {
    module('when isSessionLogoutEnabled feature toggle is true', function (hooks) {
      hooks.beforeEach(async function () {
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ isSessionLogoutEnabled: true });

        this.requestManagerStub = { request: sinon.stub().resolves() };
        this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });
      });

      module('when /api/oidc/logout returns redirectLogoutUrl', function () {
        test('sets alternativeRootURL to redirectLogoutUrl', async function (assert) {
          // given
          const redirectLogoutUrl = 'https://redirect.example.net/';
          this.requestManagerStub.request = sinon.stub().resolves({
            content: {
              redirectLogoutUrl,
            },
          });

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

          // when
          await authenticator.invalidate({
            shouldCloseSession: true,
            identityProviderCode: 'OIDC_PARTNER',
            logoutUrlUuid: 'uuid',
          });

          // then
          assert.strictEqual(authenticator.session.alternativeRootURL, redirectLogoutUrl);
        });
      });

      module('when /api/oidc/logout returns nothing', function () {
        test('does not set alternativeRootURL', async function (assert) {
          // given
          this.requestManagerStub.request = sinon.stub().resolves({ content: {} });

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

          // when
          await authenticator.invalidate({
            shouldCloseSession: true,
            identityProviderCode: 'OIDC_PARTNER',
            logoutUrlUuid: 'uuid',
          });

          // then
          assert.strictEqual(authenticator.session.alternativeRootURL, undefined);
        });
      });
    });

    module('when isSessionLogoutEnabled feature toggle is false', function (hooks) {
      hooks.beforeEach(async function () {
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ isSessionLogoutEnabled: false });
      });

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
          sinon.stub(window, 'fetch').resolves({
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
        });
      });
    });
  });
});
