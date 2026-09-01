import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Unit | Controller | authenticated/certification-frameworks/certification-framework/versions/version/scoring',
  function (hooks) {
    setupTest(hooks);

    let controller;

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:authenticated/certification-frameworks/certification-framework/versions/version/scoring',
      );
    });

    module('#toggleActivationModal', function () {
      test('opens the modal when called once', function (assert) {
        assert.false(controller.isActivationModalOpen);

        controller.toggleActivationModal();

        assert.true(controller.isActivationModalOpen);
      });

      test('closes the modal when called twice', function (assert) {
        controller.toggleActivationModal();
        controller.toggleActivationModal();

        assert.false(controller.isActivationModalOpen);
      });
    });

    module('#hasGlobalScoringError', function () {
      test('returns false when all bounds are valid', function (assert) {
        controller.model = {
          editVersion: {
            globalScoringConfiguration: [
              { meshLevel: 0, bounds: { min: -4, max: -1 } },
              { meshLevel: 1, bounds: { min: -1, max: 2 } },
            ],
          },
          calibrationScoringConfiguration: null,
        };

        assert.false(controller.hasGlobalScoringError);
      });

      test('returns true when at least one bound has max <= min', function (assert) {
        controller.model = {
          editVersion: {
            globalScoringConfiguration: [
              { meshLevel: 0, bounds: { min: -4, max: -1 } },
              { meshLevel: 1, bounds: { min: 2, max: 1 } },
            ],
          },
          calibrationScoringConfiguration: null,
        };

        assert.true(controller.hasGlobalScoringError);
      });

      test('falls back to calibrationScoringConfiguration when editVersion has no configuration', function (assert) {
        controller.model = {
          editVersion: { globalScoringConfiguration: null },
          calibrationScoringConfiguration: {
            globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: 1, max: 0 } }],
          },
        };

        assert.true(controller.hasGlobalScoringError);
      });
    });
  },
);
