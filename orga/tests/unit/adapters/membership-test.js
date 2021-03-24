import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | membership', (hooks) => {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:membership');
    sinon.stub(adapter, 'ajax').resolves();
  });

  hooks.afterEach(() => {
    adapter.ajax.restore();
  });

  module('#urlForQuery', () => {

    test('should build query url from organization id', async function(assert) {
      const query = { filter: { organizationId: '1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/1/memberships'));
      assert.equal(query.filter.organizationId, undefined);
    });
  });

  module('#updateRecord', () => {

    module('when disabled adapter option is provided', () => {

      test('it should trigger a POST request to /memberships/{id}/disable', async function(assert) {
        // when
        const data = Symbol('membership');
        await adapter.updateRecord({}, { modelName: 'membership' }, { id: 1, adapterOptions: { disable: true }, serialize: sinon.stub().returns(data) });

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/memberships/1/disable', 'POST', { data });
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
