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
        refresh: sinon.stub(),
      };
    });

    module('#activateVersion', function () {
      test('saves the draft version data and activates the version', async function (assert) {
        const draftVersion = {
          id: 42,
          globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -2 } }],
          competencesScoringConfiguration: null,
          save: sinon.stub().resolves(),
        };

        await controller.activateVersion(draftVersion, null);

        assert.strictEqual(draftVersion.save.callCount, 2);
        sinon.assert.calledWith(draftVersion.save.secondCall, { adapterOptions: { activate: true } });
      });

      test('shows a success notification and redirects after activation', async function (assert) {
        const draftVersion = {
          id: 42,
          globalScoringConfiguration: [],
          competencesScoringConfiguration: null,
          save: sinon.stub().resolves(),
        };

        await controller.activateVersion(draftVersion, null);

        sinon.assert.calledOnce(controller.pixToast.sendSuccessNotification);
        sinon.assert.calledWith(
          controller.router.transitionTo,
          'authenticated.certification-frameworks.certification-framework',
        );
        assert.ok(true);
      });

      test('shows an error notification when the save fails', async function (assert) {
        const draftVersion = {
          id: 42,
          globalScoringConfiguration: [],
          competencesScoringConfiguration: null,
          save: sinon.stub().rejects(new Error('network error')),
        };

        await controller.activateVersion(draftVersion, null);

        sinon.assert.calledOnce(controller.pixToast.sendErrorNotification);
        sinon.assert.notCalled(controller.router.transitionTo);
        assert.ok(true);
      });
    });
  },
);
