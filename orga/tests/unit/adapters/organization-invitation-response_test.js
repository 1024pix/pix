import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | organization-invitation-response', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-invitation-response');
  });

  module('#urlForCreateRecord', function () {
    test('should build update url from organization-invitation-response id', async function (assert) {
      // given
      const organizationInvitationId = 123;
      const options = {
        adapterOptions: { organizationInvitationId },
      };

      // when
      const url = await adapter.urlForCreateRecord('organization-invitation-response', options);

      // then
      assert.true(url.endsWith(`/organization-invitations/${organizationInvitationId}/response`));
    });
  });
});
