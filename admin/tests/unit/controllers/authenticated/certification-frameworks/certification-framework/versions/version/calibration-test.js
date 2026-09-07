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

    module('#activateVersion', function () {
      test('delegates to versionController.activateVersion with draftVersion only', function (assert) {
        const draftVersion = { id: 1 };
        controller.model = { draftVersion };

        const activateVersionStub = sinon.stub();
        controller.versionController = { activateVersion: activateVersionStub };

        controller.activateVersion();

        sinon.assert.calledWithExactly(activateVersionStub, draftVersion);
        assert.ok(true);
      });
    });
  },
);
