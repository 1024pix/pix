import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | AttachedOrganization', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:attached-organization');
  });

  module('#urlForQuery', function () {
    test('it builds the correct URL from certificationCenterId and removes certificationCenterId from the query object', function (assert) {
      // given
      const query = { certificationCenterId: 10 };

      // when
      const url = adapter.urlForQuery(query);

      // then
      assert.ok(url.endsWith('/admin/certification-centers/10/organizations'));
      assert.strictEqual(query.certificationCenterId, undefined);
    });
  });
});
