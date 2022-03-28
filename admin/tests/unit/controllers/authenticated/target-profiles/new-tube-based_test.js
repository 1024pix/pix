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
    test('should delete record and go back target profile list page', async function (assert) {
      controller.store.deleteRecord = sinon.stub();
      controller.transitionToRoute = sinon.stub();
      controller.model = { targetProfile: Symbol('targetProfile') };

      controller.goBackToTargetProfileList();

      assert.ok(controller.store.deleteRecord.calledWith(controller.model.targetProfile));
      assert.ok(controller.transitionToRoute.calledWith('authenticated.target-profiles.list'));
    });
  });

  module('#frameworkOptions', function () {
    test('it should return a framework list as multiselect option data', async function (assert) {
      controller.frameworks = [
        { name: 'framework1', id: 'id1' },
        { name: 'framework2', id: 'id2' },
      ];

      // when
      const result = controller.frameworkOptions;

      assert.deepEqual(result, [
        { label: 'framework1', value: 'id1' },
        { label: 'framework2', value: 'id2' },
      ]);
    });
  });
});
