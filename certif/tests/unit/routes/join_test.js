import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | join', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('it should return certification center name', async function (assert) {
      // given
      const route = this.owner.lookup('route:join');
      const store = this.owner.lookup('service:store');

      const jirayaInvitation = store.createRecord('certification-center-invitation', {
        certificationCenterName: 'Ninja School',
      });
      sinon.stub(store, 'queryRecord');
      store.queryRecord
        .withArgs('certification-center-invitation', {
          invitationId: 12345,
          code: 'JIJI987',
        })
        .resolves(jirayaInvitation);

      // when
      const params = {
        invitationId: 12345,
        code: 'JIJI987',
      };
      const { certificationCenterName } = await route.model(params);

      // then
      assert.strictEqual(certificationCenterName, 'Ninja School');
    });
  });
});
