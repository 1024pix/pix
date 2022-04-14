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
      controller.store.deleteRecord = sinon.stub();
      controller.router.transitionTo = sinon.stub();
      controller.model = { targetProfile: Symbol('targetProfile') };

      controller.goBackToTargetProfileList();

      assert.ok(controller.store.deleteRecord.calledWith(controller.model.targetProfile));
      assert.ok(controller.router.transitionTo.calledWith('authenticated.target-profiles.list'));
    });
  });
});
