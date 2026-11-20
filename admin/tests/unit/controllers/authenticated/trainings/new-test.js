import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl, { t } from '../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/trainings/new', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/trainings/new');
  });

  module('#goToTrainingDetails', function () {
    test('should go to training details page', async function (assert) {
      controller.router.transitionTo = sinon.stub();

      controller.goToTrainingDetails();

      assert.ok(controller.router.transitionTo.calledWith('authenticated.trainings.training'));
    });
  });

  module('#goBackToTrainingList', function () {
    test('should go to training list page', async function (assert) {
      controller.router.transitionTo = sinon.stub();

      controller.goBackToTrainingList();

      assert.ok(controller.router.transitionTo.calledWith('authenticated.trainings.list'));
    });
  });

  module('#createOrUpdateTraining', function () {
    test('it should save training', async function (assert) {
      const trainingData = {
        id: 3,
        title: 'Ma formation',
        link: 'https://mon-lien',
        type: 'webinaire',
        locale: 'fr-fr',
        editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/mon-logo.svg',
        editorName: 'Un éditeur de contenu formatif',
        duration: '6h',
      };

      const saveStub = sinon.stub().resolves({ id: trainingData.id });

      controller.store.createRecord = sinon.stub().withArgs('training', trainingData).returns({ save: saveStub });

      controller.router.transitionTo = sinon.stub();

      controller.pixToast = {
        sendSuccessNotification: sinon.stub(),
      };

      // when
      await controller.createOrUpdateTraining(trainingData);

      // then
      assert.ok(saveStub.called);
      assert.ok(
        controller.pixToast.sendSuccessNotification.calledWith({
          message: 'Le contenu formatif a été créé avec succès.',
        }),
      );
      assert.ok(controller.router.transitionTo.calledWith('authenticated.trainings.training', trainingData.id));
    });

    module('when training cannot be saved', function () {
      module('when the editorLogoUrl format is incorrect', function () {
        test('it should display a specific error message', async function (assert) {
          controller.pixToast = {
            sendErrorNotification: sinon.stub(),
          };

          const saveStub = sinon
            .stub()
            .rejects({ errors: [{ status: '400', detail: 'data.attributes.editor-logo-url' }] });

          controller.store.createRecord = sinon.stub().returns({ save: saveStub });

          // when
          await controller.createOrUpdateTraining();

          // then
          assert.ok(saveStub.called);
          assert.ok(
            controller.pixToast.sendErrorNotification.calledWith({
              message: t('pages.trainings.training.error-messages.incorrect-editor-logo-url-format'),
            }),
          );
        });
      });

      module('for 400, 404, 412, 422 HTTP errors', function () {
        test('it should display the error detail message', async function (assert) {
          controller.pixToast = {
            sendErrorNotification: sinon.stub(),
          };

          const saveStub = sinon.stub().rejects({ errors: [{ status: '404', detail: 'Ressource introuvable.' }] });

          controller.store.createRecord = sinon.stub().returns({ save: saveStub });

          // when
          await controller.createOrUpdateTraining();

          // then
          assert.ok(saveStub.called);
          assert.ok(controller.pixToast.sendErrorNotification.calledWith({ message: 'Ressource introuvable.' }));
        });
      });

      module('for other errors', function () {
        test('it should display the default error message', async function (assert) {
          controller.pixToast = {
            sendErrorNotification: sinon.stub(),
          };

          const saveStub = sinon.stub().rejects();

          controller.store.createRecord = sinon.stub().returns({ save: saveStub });

          // when
          await controller.createOrUpdateTraining();

          // then
          assert.ok(saveStub.called);
          assert.ok(controller.pixToast.sendErrorNotification.calledWith({ message: 'Une erreur est survenue.' }));
        });
      });
    });
  });
});
