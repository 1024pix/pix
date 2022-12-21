import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | organization-invitation', function (hooks) {
  setupTest(hooks);

  module('#urlForUpdateRecord', function () {
    test('should build update url from organization-invitation id', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:organization-invitation');

      const organizationId = 666;

      // when
      const url = await adapter.urlForUpdateRecord(777, 'organization-invitation', {
        adapterOptions: { resendInvitation: true, organizationId },
      });

      // then
      assert.true(url.endsWith(`/organizations/${organizationId}/resend-invitation`));
    });
  });
});
