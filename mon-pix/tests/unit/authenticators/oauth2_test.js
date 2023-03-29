import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

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
});
