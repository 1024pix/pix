import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | certificationCenterMembership', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:certification-center-membership');
  });

  module('#urlForQuery', () => {

    test('should build query url from certificationCenter id', async function(assert) {
      const query = { filter: { certificationCenterId: '1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/certification-centers/1/certification-center-memberships'));
      assert.equal(query.filter.certificationCenterId, undefined);
    });
  });
});
