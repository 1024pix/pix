import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | Target Profile', function(hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:target-profile');
  });

  module('#urlForQuery', function() {

    test('should add /admin inside the default url for query', function(assert) {
      // when
      const url = adapter.urlForQuery();

      // then
      assert.ok(url.endsWith('/api/admin/target-profiles'));
    });
  });

  module('#urlForFindRecord', function() {

    test('should add /admin inside the default url for find record', function(assert) {
      // when
      const url = adapter.urlForFindRecord(123, 'target-profile');

      // then
      assert.ok(url.endsWith('/api/admin/target-profiles/123'));
    });
  });
});
