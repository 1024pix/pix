import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | publishable session', function(hooks) {
  setupTest(hooks);

  module('#urlForQuery', function() {
    test('should return /admin/sessions/to-publish', function(assert) {
      // when
      const adapter = this.owner.lookup('adapter:publishable-session');
      const url = adapter.urlForQuery();

      // then
      assert.ok(url.endsWith('api/admin/sessions/to-publish'));
    });
  });
});
