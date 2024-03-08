import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | with required action session', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('should return /admin/sessions/with-required-action', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:with-required-action-session');
      const url = adapter.urlForQuery();

      // then
      assert.ok(url.endsWith('api/admin/sessions/with-required-action'));
    });
  });
});
