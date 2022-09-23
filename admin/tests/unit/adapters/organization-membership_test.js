import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | organization-membership', function (hooks) {
  setupTest(hooks);

  let adapter;
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    adapter = this.owner.lookup('adapter:organization-membership');
    sinon.stub(adapter, 'ajax').resolves();
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#updateRecord', function () {
    test('it should trigger a PATCH request to /admin/memberships/{id}', async function (assert) {
      // when
      const serializer = { serializeIntoHash: sinon.stub().returns() };
      store.serializerFor = sinon.stub().returns(serializer);

      await adapter.updateRecord(store, { modelName: 'organizationMembership' }, { id: 1 });

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/admin/memberships/1', 'PATCH', { data: {} });
      assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
    });

    module('when disabled adapter option is provided', function () {
      test('it should trigger a POST request to /admin/memberships/{id}/disable', async function (assert) {
        // when
        const data = Symbol('organizationMembership');
        await adapter.updateRecord(
          {},
          { modelName: 'organizationMembership' },
          { id: 1, adapterOptions: { disable: true }, serialize: sinon.stub().returns(data) }
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
