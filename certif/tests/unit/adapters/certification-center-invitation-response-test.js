import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | certification-center-invitation-response', function (hooks) {
  setupTest(hooks);

  module('#urlForCreateRecord', function () {
    test('should build create url from certification-center-invitation id', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-center-invitation-response');
      const options = { adapterOptions: { certificationCenterInvitationId: 1 } };

      // when
      const url = await adapter.urlForCreateRecord('certification-center-invitation-response', options);

      // then
      assert.true(url.endsWith('/certification-center-invitations/1/accept'));
    });
  });
});
