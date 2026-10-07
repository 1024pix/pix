import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Authenticator | oauth2', function (hooks) {
  setupTest(hooks);

  test('should have token and token revocation endpoints', function (assert) {
    // Given
    const serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
    const serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;

    // When
    const authenticator = this.owner.lookup('authenticator:oauth2');

    // Then
    assert.strictEqual(authenticator.serverTokenEndpoint, serverTokenEndpoint);
    assert.strictEqual(authenticator.serverTokenRevocationEndpoint, serverTokenRevocationEndpoint);
  });

  module('#invalidate', function () {
    module('when isSessionLogoutEnabled feature toggle is true', function (hooks) {
      hooks.beforeEach(async function () {
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ isSessionLogoutEnabled: true });

        this.requestManagerStub = { request: sinon.stub().resolves() };
        this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });
      });

      module('when there is any error (API error, network error)', function () {
        test('never fails so that the session-store is nevertheless always cleared', async function (assert) {
          // given
          this.requestManagerStub.request = sinon.stub().rejects(new Error('Some unknown network error'));

          const authenticator = this.owner.lookup('authenticator:oauth2');

          // when
          const promise = authenticator.invalidate({
            access_token: 'test_access_token',
            refresh_token: 'test_refresh_token',
          });

          // then
          await promise.then(() => {
            assert.step('no-reject');
          });
          assert.verifySteps(['no-reject']);
        });
      });

      test('sends POST request on /api/logout to invalidate user’s session', async function (assert) {
        // given
        const authenticator = this.owner.lookup('authenticator:oauth2');

        // when
        await authenticator.invalidate({ access_token: 'test_access_token', refresh_token: 'test_refresh_token' });

        // then
        assert.true(true);

        sinon.assert.calledOnceWithExactly(this.requestManagerStub.request, {
          url: 'http://localhost:3000/api/logout',
          method: 'POST',
        });
      });
    });

    module('when isSessionLogoutEnabled feature toggle is false', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(window, 'fetch').resolves();
      });

      test('calls default invalidate implementation', async function (assert) {
        // given
        const authenticator = this.owner.lookup('authenticator:oauth2');
        authenticator.featureToggles = {
          featureToggles: {
            isSessionLogoutEnabled: false,
          },
        };

        // when
        await authenticator.invalidate({ access_token: 'test_access_token', refresh_token: 'test_refresh_token' });

        // then
        assert.true(true);
        sinon.assert.calledTwice(window.fetch);
        sinon.assert.calledWithExactly(window.fetch.firstCall, 'http://localhost:3000/api/revoke', {
          body: 'token_type_hint=access_token&token=test_access_token',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          method: 'POST',
        });
        sinon.assert.calledWithExactly(window.fetch.secondCall, 'http://localhost:3000/api/revoke', {
          body: 'token_type_hint=refresh_token&token=test_refresh_token',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          method: 'POST',
        });
      });
    });
  });
});
