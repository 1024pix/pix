import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | student', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:student');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForQuery', () => {
    test('should build query url from organization id', async function(assert) {
      const query = { filter: { organizationId: 'organizationId1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/organizationId1/students'));
      assert.equal(query.organizationId, undefined);
    });
  });
});
