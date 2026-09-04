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
      controller.pixToast = {
        sendSuccessNotification: sinon.stub(),
        sendErrorNotification: sinon.stub(),
      };
      controller.intl = { t: sinon.stub().returns('') };
      controller.router = { transitionTo: sinon.stub().resolves() };
      controller.store = { findAll: sinon.stub().resolves() };
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

    module('#saveScoring', function () {
      test('delegates to versionController.saveScoring and shows a success toast', async function (assert) {
        const editVersion = { id: 1 };
        const calibrationScoringConfiguration = { globalScoringConfiguration: [] };
        controller.model = { editVersion, calibrationScoringConfiguration };

        const saveScoringStub = sinon.stub().resolves();
        controller.versionController = { saveScoring: saveScoringStub };

        await controller.saveScoring();

        sinon.assert.calledWithExactly(saveScoringStub, editVersion, calibrationScoringConfiguration);
        sinon.assert.calledOnce(controller.pixToast.sendSuccessNotification);
        assert.ok(true);
      });

      test('shows an error toast when saveScoring fails', async function (assert) {
        controller.model = {
          editVersion: { id: 1 },
          calibrationScoringConfiguration: null,
        };
        controller.versionController = { saveScoring: sinon.stub().rejects(new Error('fail')) };

        await controller.saveScoring();

        sinon.assert.calledOnce(controller.pixToast.sendErrorNotification);
        assert.ok(true);
      });
    });

    module('#saveScoringAndActivate', function () {
      test('delegates saveScoring then activateVersion to versionController', async function (assert) {
        const editVersion = { id: 1 };
        const calibrationScoringConfiguration = { globalScoringConfiguration: [] };
        controller.model = { editVersion, calibrationScoringConfiguration };

        const saveScoringStub = sinon.stub().resolves();
        const activateVersionStub = sinon.stub().resolves();
        controller.versionController = { saveScoring: saveScoringStub, activateVersion: activateVersionStub };

        await controller.saveScoringAndActivate();

        sinon.assert.calledWithExactly(saveScoringStub, editVersion, calibrationScoringConfiguration);
        sinon.assert.calledWithExactly(activateVersionStub, editVersion);
        assert.ok(true);
      });

      test('shows an error toast when saveScoring fails', async function (assert) {
        controller.model = { editVersion: { id: 1 }, calibrationScoringConfiguration: null };
        controller.versionController = {
          saveScoring: sinon.stub().rejects(new Error('fail')),
          activateVersion: sinon.stub(),
        };

        await controller.saveScoringAndActivate();

        sinon.assert.calledOnce(controller.pixToast.sendErrorNotification);
        sinon.assert.notCalled(controller.versionController.activateVersion);
        assert.ok(true);
      });
    });
  },
);
