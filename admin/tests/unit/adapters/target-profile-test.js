import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | Target Profile', function(hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:target-profile');
  });

  module('#urlForQuery', function() {

    test('should add /admin inside the default query url', function(assert) {
      // when
      const url = adapter.urlForQuery();

      // then
      assert.ok(url.endsWith('/api/admin/target-profiles'));
    });
  });
});
