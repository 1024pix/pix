import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module(
  'Unit | Controller | authenticated/certification-frameworks/certification-framework/versions/version',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let controller;

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:authenticated/certification-frameworks/certification-framework/versions/version',
      );

      controller.pixToast = {
        sendSuccessNotification: sinon.stub(),
        sendErrorNotification: sinon.stub(),
      };
      controller.router = {
        transitionTo: sinon.stub().resolves(),
      };
      controller.store = {
        findAll: sinon.stub().resolves(),
      };
    });

    module('#activateVersion', function () {
      test('activates the version', async function (assert) {
        const draftVersion = { id: 42, save: sinon.stub().resolves() };

        await controller.activateVersion(draftVersion);

        sinon.assert.calledWithExactly(draftVersion.save, { adapterOptions: { activate: true } });
        assert.ok(true);
      });

      test('shows a success notification and redirects after activation', async function (assert) {
        const draftVersion = { id: 42, save: sinon.stub().resolves() };

        await controller.activateVersion(draftVersion);

        sinon.assert.calledOnce(controller.pixToast.sendSuccessNotification);
        sinon.assert.calledWith(
          controller.router.transitionTo,
          'authenticated.certification-frameworks.certification-framework',
        );
        assert.ok(true);
      });

      test('shows an error notification when activation fails', async function (assert) {
        const draftVersion = { id: 42, save: sinon.stub().rejects(new Error('network error')) };

        await controller.activateVersion(draftVersion);

        sinon.assert.calledOnce(controller.pixToast.sendErrorNotification);
        sinon.assert.notCalled(controller.router.transitionTo);
        assert.ok(true);
      });
    });
  },
);
