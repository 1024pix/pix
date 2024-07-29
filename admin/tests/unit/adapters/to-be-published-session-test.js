import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | to be published session', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('should return /admin/sessions/to-publish', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:to-be-published-session');
      const url = adapter.urlForQuery();

      // then
      assert.ok(url.endsWith('api/admin/sessions/to-publish'));
    });
  });

  module('#urlForUpdateRecord', function () {
    test('should return /admin/sessions/:id', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:to-be-published-session');
      const url = adapter.urlForUpdateRecord(123);

      // then
      assert.ok(url.endsWith('api/admin/sessions/123'));
    });
  });
});
