import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | certification details', function (hooks) {
  setupTest(hooks);

  module('#urlForFindRecord', function () {
    test('should build get url from certification details id', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:certification-details');
      const url = adapter.urlForFindRecord(123, 'certification-details');

      // then
      assert.ok(url.endsWith('/admin/certifications/123/details'));
    });
  });

  module('#buildURL', function () {
    test('should build challenge neutralization base URL when called with according requestType', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:certification-details');
      const url = adapter.buildURL(123, 'certification-details', null, 'challenge-neutralization');

      // then
      assert.ok(url.endsWith('/admin/certification/'));
    });
  });
});
