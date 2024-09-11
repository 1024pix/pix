import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | organization-places-lot', function (hooks) {
  setupTest(hooks);

  module('#urlForFindAll', function () {
    test('should build findAll url from organization-places-lot wit organizationId', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:organization-places-lot');
      const organizationId = 4;

      // when
      const url = await adapter.urlForQuery({ filter: { organizationId } });

      // then
      assert.true(url.endsWith(`/organizations/${organizationId}/places-lots`));
    });
  });
});
