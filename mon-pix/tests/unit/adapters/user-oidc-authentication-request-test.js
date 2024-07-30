import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | user-oidc-authentication-request', function (hooks) {
  setupTest(hooks);

  module('#buildUrl', function () {
    test('should build url', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:user-oidc-authentication-request');
      const url = adapter.buildURL();

      // then
      assert.true(url.endsWith('user/'));
    });
  });
});
