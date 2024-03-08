import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | certified profile', function (hooks) {
  setupTest(hooks);

  module('#urlForFindRecord', function () {
    test('should build URL', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:certified-profile');
      const url = adapter.urlForFindRecord(123, 'certified-profile');

      // then
      assert.ok(url.endsWith('/admin/certifications/123/certified-profile'));
    });
  });
});
