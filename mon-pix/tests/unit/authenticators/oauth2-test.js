import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import ENV from '../../../config/environment';

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

  module('#invalidate', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(window, 'fetch').resolves();
    });

    module('when isSessionLogoutEnabled feature toggle is true', function () {
      test('sends POST request on /api/logout to invalidate user’s session', async function (assert) {
        // given
        const authenticator = this.owner.lookup('authenticator:oauth2');
        authenticator.featureToggles = {
          featureToggles: {
            isSessionLogoutEnabled: true,
          },
        };

        // when
        await authenticator.invalidate({ access_token: 'test_access_token', refresh_token: 'test_refresh_token' });

        // then
        assert.true(true);
        sinon.assert.calledOnceWithExactly(window.fetch, 'http://localhost:3000/api/logout', {
          headers: { Authorization: 'Bearer test_access_token' },
          method: 'POST',
        });
      });
    });

    module('when isSessionLogoutEnabled feature toggle is false', function () {
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
