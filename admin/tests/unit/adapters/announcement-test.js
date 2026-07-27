import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | announcement', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:announcement');
  });

  module('#urlForFindRecord', function () {
    test('should build the find url on the public (non-admin) namespace', function (assert) {
      // when
      const url = adapter.urlForFindRecord('SCO', 'announcement');

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/announcements/SCO');
    });
  });

  module('#urlForUpdateRecord', function () {
    test('should build the update url on the admin namespace', function (assert) {
      // when
      const url = adapter.urlForUpdateRecord('SCO', 'announcement');

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/admin/announcements/SCO');
    });
  });
});
