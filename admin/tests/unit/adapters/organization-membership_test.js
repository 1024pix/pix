import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | organization-membership', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-membership');
    sinon.stub(adapter, 'ajax').resolves();
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#deleteRecord', function () {
    module('when disabled adapter option is provided', function () {
      test('it should trigger a POST request to /admin/memberships/{id}/disable', async function (assert) {
        // when
        const data = {};
        await adapter.deleteRecord(
          {},
          { modelName: 'organizationMembership' },
          { id: 1, adapterOptions: { disable: true }, serialize: sinon.stub().returns(data) },
        );

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/admin/memberships/1/disable', 'POST', {
          data,
        });
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
