import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | AdminMember', function (hooks) {
  setupTest(hooks);
  module('#urlForQueryRecord', function () {
    test('should return right url if the query url contains me', function (assert) {
      // when
      const query = { me: true };
      const adapter = this.owner.lookup('adapter:admin-member');
      const url = adapter.urlForQueryRecord(query);

      // then
      assert.ok(url.endsWith('/admin/admin-members/me'));
      assert.strictEqual(query.me, undefined);
    });
  });
});
