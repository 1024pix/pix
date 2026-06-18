import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | AttachedCertificationCenter', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:attached-certification-center');
  });

  module('#urlForQuery', function () {
    test('it builds the correct URL from organizationId', function (assert) {
      // when
      const query = { organizationId: 10 };
      const url = adapter.urlForQuery(query);

      // then
      assert.ok(url.endsWith('/admin/organizations/10/certification-centers'));
    });

    test('it removes organizationId from the query object', function (assert) {
      // when
      const query = { organizationId: 10 };
      adapter.urlForQuery(query);

      // then
      assert.strictEqual(query.organizationId, undefined);
    });
  });
});
