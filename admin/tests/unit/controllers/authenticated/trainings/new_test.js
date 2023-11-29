import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/trainings/new', function (hooks) {
  setupTest(hooks);

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

  module('#createOrUpdateTraining', function () {
    test('it should save training', async function (assert) {
      const trainingData = {
        id: 3,
        title: 'Ma formation',
        link: 'https://mon-lien',
        type: 'webinaire',
        locale: 'fr-fr',
        editorLogoUrl: 'https//images.fr/mon-logo.svg',
        editorName: 'Un éditeur de contenu formatif',
        duration: '6h',
      };

      const saveStub = sinon.stub().resolves({ id: trainingData.id });

      controller.store.createRecord = sinon.stub().withArgs('training', trainingData).returns({ save: saveStub });

      controller.router.transitionTo = sinon.stub();

      controller.notifications = {
        success: sinon.stub(),
      };

      // when
      await controller.createOrUpdateTraining(trainingData);

      // then
      assert.ok(saveStub.called);
      assert.ok(controller.notifications.success.calledWith('Le contenu formatif a été créé avec succès.'));
      assert.ok(controller.router.transitionTo.calledWith('authenticated.trainings.training', trainingData.id));
    });

    test('it should display error notification when training cannot be saved', async function (assert) {
      controller.notifications = {
        error: sinon.stub(),
      };

      const saveStub = sinon.stub().rejects();

      controller.store.createRecord = sinon.stub().returns({ save: saveStub });

      // when
      await controller.createOrUpdateTraining();

      // then
      assert.ok(saveStub.called);
      assert.ok(controller.notifications.error.calledWith('Une erreur est survenue.'));
    });
  });
});
