import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | CreditsLotAdapter', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:credits-lot');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForQuery', function () {
    test('should build query url from organization id', async function (assert) {
      // given
      const query = { organizationId: '56' };

      // when
      const url = await adapter.urlForQuery(query);

      // then
      assert.ok(url.endsWith('/api/admin/organizations/56/credits-lots'));
      assert.strictEqual(query.organizationId, undefined);
    });
  });

  module('#urlForCreateRecord', function () {
    test('should call /api/admin/certification-centers/id/certification-center-memberships', async function (assert) {
      // given
      const snapshot = {
        adapterOptions: {
          organizationId: 56,
        },
      };

      // when
      const url = await adapter.urlForCreateRecord('credits-lot', snapshot);

      // then
      assert.true(url.endsWith('/api/admin/organizations/56/credits-lots'));
    });
  });
});
