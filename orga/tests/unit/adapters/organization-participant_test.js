import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | organization-participant', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-participant');
    ajaxStub = sinon.stub();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForQuery', () => {
    test('should build query url from organization id', async function (assert) {
      const query = { filter: { organizationId: 'organizationId1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/organizationId1/participants'));
      assert.strictEqual(query.organizationId, undefined);
    });
  });
});
