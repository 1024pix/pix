import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module(
  'Unit | Controller | authenticated/certification-frameworks/certification-framework/versions/version/calibration',
  function (hooks) {
    setupTest(hooks);

    let controller;

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:authenticated/certification-frameworks/certification-framework/versions/version/calibration',
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

    module('#hasNoExternalCalibrationId', function () {
      test('returns true when externalCalibrationId is null', function (assert) {
        controller.model = { draftVersion: { externalCalibrationId: null } };

        assert.true(controller.hasNoExternalCalibrationId);
      });

      test('returns false when externalCalibrationId is set', function (assert) {
        controller.model = { draftVersion: { externalCalibrationId: 42 } };

        assert.false(controller.hasNoExternalCalibrationId);
      });
    });

    module('#isPixPlusScope', function () {
      test('returns true when scope is not CORE', function (assert) {
        controller.model = { draftVersion: { scope: 'PIX_PLUS_EDU_2ND_DEGRE' } };

        assert.true(controller.isPixPlusScope);
      });

      test('returns false when scope is CORE', function (assert) {
        controller.model = { draftVersion: { scope: 'CORE' } };

        assert.false(controller.isPixPlusScope);
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
