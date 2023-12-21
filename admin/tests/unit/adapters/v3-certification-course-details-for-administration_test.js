import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | v3-certification-course-details-for-administration', function (hooks) {
  setupTest(hooks);

  module('#urlForFindRecord', function () {
    test('should build get url from certification details id', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:v3-certification-course-details-for-administration');
      const url = adapter.urlForFindRecord(123, 'v3-certification-course-details-for-administration');

      // then
      assert.ok(url.endsWith('/admin/certification-courses-v3/123/details'));
    });
  });
});
