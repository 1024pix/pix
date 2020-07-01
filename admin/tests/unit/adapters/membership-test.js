import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | membership', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:membership');
    sinon.stub(adapter, 'ajax').resolves();
  });

  hooks.afterEach(function() {
    adapter.ajax.restore();
  });

  module('#updateRecord', function() {

    module('when disabled adapter option is provided', function() {

      test('it should trigger a POST request to /memberships/{id}/disable', async function(assert) {
        // when
        await adapter.updateRecord({}, { modelName: 'membership' }, { id: 1, adapterOptions: { disable: true } });

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/memberships/1/disable', 'POST');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
