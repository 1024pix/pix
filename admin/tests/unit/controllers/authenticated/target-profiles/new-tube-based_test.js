import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/target-profiles/new-tube-based', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/target-profiles/new-tube-based');
  });

  module('#goBackToTargetProfileList', function () {
    test('should delete record and go back to target profile list page', async function (assert) {
      // given
      controller.router.transitionTo = sinon.stub();

      // when
      controller.goBackToTargetProfileList();

      // then
      assert.ok(controller.router.transitionTo.calledWith('authenticated.target-profiles.list'));
    });
  });
});
