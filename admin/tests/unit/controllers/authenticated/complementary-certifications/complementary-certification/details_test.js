import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Unit | Controller | authenticated/complementary-centerifications/complementary-certification/details',
  function (hooks) {
    setupTest(hooks);

    let controller;

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:authenticated/complementary-certifications/complementary-certification/details',
      );
    });

    module('#targetProfileId', function () {
      module('when _targetProfileId is not defined', function () {
        test('it should return the first current target profile id', function (assert) {
          // given
          controller.model = { currentTargetProfiles: [{ id: 55 }, { id: 66 }] };
          controller._targetProfileId = undefined;

          // when
          const id = controller.targetProfileId;

          // then
          assert.strictEqual(id, 55);
        });
      });

      module('when _targetProfileId is defined', function () {
        test('it should return the current selected target profile id', function (assert) {
          // given
          controller.model = { currentTargetProfiles: [{ id: 55 }, { id: 66 }] };
          controller._targetProfileId = 66;

          // when
          const id = controller.targetProfileId;

          // then
          assert.strictEqual(id, 66);
        });
      });
    });

    module('#currentTargetProfile', function () {
      test('it should return the selected target profile', function (assert) {
        // given
        controller.model = { currentTargetProfiles: [{ id: 55 }, { id: 66 }] };
        controller._targetProfileId = 66;

        // when
        const targetProfile = controller.currentTargetProfile;

        // then
        assert.deepEqual(targetProfile, { id: 66 });
      });
    });

    module('#switchTargetProfile', function () {
      test('it should return the selected target profile', function (assert) {
        // given
        controller.model = { currentTargetProfiles: [{ id: 55 }, { id: 66 }] };
        controller._targetProfileId = 55;

        // when & then
        assert.true(controller.isToggleSwitched);

        // when
        controller.switchTargetProfile();

        // then
        assert.false(controller.isToggleSwitched);
        assert.strictEqual(controller.targetProfileId, 66);
      });
    });

    module('#reset', function () {
      test('it should set targetProfileId to null', function (assert) {
        // given
        controller._targetProfileId = '55';
        controller.isToggleSwitched = false;

        // when
        controller.reset();

        // then
        assert.strictEqual(controller._targetProfileId, null);
        assert.true(controller.isToggleSwitched);
      });
    });
  },
);
