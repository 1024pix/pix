import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | certified profile', (hooks) => {
  setupTest(hooks);

  module('#urlForFindRecord', () => {
    test('should build URL', function(assert) {
      // when
      const adapter = this.owner.lookup('adapter:certified-profile');
      const url = adapter.urlForFindRecord(123, 'certified-profile');

      // then
      assert.ok(url.endsWith('/admin/certifications/123/certified-profile'));
    });
  });
});
