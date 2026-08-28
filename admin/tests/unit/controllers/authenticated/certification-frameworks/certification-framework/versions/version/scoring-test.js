import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

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

    module('#toggleConfirmationModal', function () {
      test('opens the modal when called once', function (assert) {
        assert.false(controller.isConfirmationModalOpen);

        controller.toggleConfirmationModal();

        assert.true(controller.isConfirmationModalOpen);
      });

      test('closes the modal when called twice', function (assert) {
        controller.toggleConfirmationModal();
        controller.toggleConfirmationModal();

        assert.false(controller.isConfirmationModalOpen);
      });
    });

    module('#hasGlobalScoringError', function () {
      test('returns false when all bounds are valid', function (assert) {
        controller.model = {
          draftVersion: {
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
          draftVersion: {
            globalScoringConfiguration: [
              { meshLevel: 0, bounds: { min: -4, max: -1 } },
              { meshLevel: 1, bounds: { min: 2, max: 1 } },
            ],
          },
          calibrationScoringConfiguration: null,
        };

        assert.true(controller.hasGlobalScoringError);
      });

      test('falls back to calibrationScoringConfiguration when draftVersion has no configuration', function (assert) {
        controller.model = {
          draftVersion: { globalScoringConfiguration: null },
          calibrationScoringConfiguration: {
            globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: 1, max: 0 } }],
          },
        };

        assert.true(controller.hasGlobalScoringError);
      });
    });

    module('#activateVersion', function () {
      test('delegates to versionController.activateVersion with draftVersion and calibrationScoringConfiguration', function (assert) {
        const draftVersion = { id: 1 };
        const calibrationScoringConfiguration = { globalScoringConfiguration: [] };
        controller.model = { draftVersion, calibrationScoringConfiguration };

        const activateVersionStub = sinon.stub();
        controller.versionController = { activateVersion: activateVersionStub };

        controller.activateVersion();

        sinon.assert.calledWithExactly(activateVersionStub, draftVersion, calibrationScoringConfiguration);
        assert.ok(true);
      });
    });
  },
);
