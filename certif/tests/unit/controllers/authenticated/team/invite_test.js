import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/team/invite', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/invite');
  });

  module('#cancel', function () {
    test('cancel action transitions to authenticated.team.list.invitations route', async function (assert) {
      // given
      sinon.stub(controller.router, 'transitionTo');

      // when
      await controller.send('cancel');

      // then
      assert.ok(controller.router.transitionTo.calledWith('authenticated.team.list.invitations'));
    });
  });
});
