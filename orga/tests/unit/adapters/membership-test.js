import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | membership', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:membership');
  });

  module('#urlForQuery', () => {

    test('should build query url from organization id', async function(assert) {
      const query = { filter: { organizationId: '1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/1/memberships'));
      assert.equal(query.filter.organizationId, undefined);
    });
  });

});
