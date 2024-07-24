import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | organization-place-statistic', function (hooks) {
  setupTest(hooks);

  module('#urlForQueryRecord', function () {
    test('should build update url from organization-place-statistic wit organizationId', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:organization-place-statistic');

      const organizationId = 777;

      // when
      const url = await adapter.urlForQueryRecord({ organizationId });

      // then
      assert.true(url.endsWith(`/organizations/${organizationId}/place-statistics`));
    });
  });
});
