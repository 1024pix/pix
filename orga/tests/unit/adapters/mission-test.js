import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | mission', function (hooks) {
  setupTest(hooks);

  module('#urlForFindAll', () => {
    test('should build url from organization id', async function (assert) {
      const adapter = this.owner.lookup('adapter:mission');
      const adapterOptions = { organizationId: 4 };

      const url = await adapter.urlForFindAll({}, { adapterOptions });

      assert.ok(url.endsWith('/api/organizations/4/missions'));
    });
  });
});
