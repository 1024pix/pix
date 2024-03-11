import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | reset-expired-password-demand', function (hooks) {
  setupTest(hooks);

  module('#buildUrl', function () {
    test('should build url', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:reset-expired-password-demand');
      const url = adapter.buildURL();

      // then
      assert.true(url.endsWith('api/'));
    });
  });
});
