import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/autonomous-courses/new', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/autonomous-courses/new');
  });

  module('#goBackToAutonomousCoursesList', function () {
    test('should go back to autonomous courses list page', async function (assert) {
      // given
      controller.router.transitionTo = sinon.stub();

      // when
      controller.goBackToAutonomousCoursesList();

      // then
      assert.ok(controller.router.transitionTo.calledWith('authenticated.autonomous-courses.list'));
    });
  });

  module('#createAutonomousCourse', function () {
    test('it should save autonomous course', async function (assert) {
      // given
      const autonomousCourse = {
        internalTitle: 'un nom interne',
        publicTitle: 'un nom public',
        targetProfileId: 32,
        customLandingPageText: "un texte de page d'accueil",
      };

      const saveStub = sinon.stub().resolves({ id: autonomousCourse.id });

      controller.store.createRecord = sinon
        .stub()
        .withArgs('autonomous-course', autonomousCourse)
        .returns({ save: saveStub });

      controller.router.transitionTo = sinon.stub();

      controller.notifications = {
        success: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.createAutonomousCourse(event, autonomousCourse);

      // then
      assert.ok(saveStub.called);
      assert.ok(controller.notifications.success.calledWith('Le parcours autonome a été créé avec succès.'));
      assert.ok(controller.router.transitionTo.calledWith('authenticated.autonomous-courses.list'));
    });

    test('it should display error notification when autonomous-course cannot be saved', async function (assert) {
      // given
      const autonomousCourse = {
        targetProfileId: 32,
      };
      controller.notifications = {
        error: sinon.stub(),
      };

      const saveStub = sinon.stub().rejects();

      controller.store.createRecord = sinon.stub().returns({ save: saveStub });

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.createAutonomousCourse(event, autonomousCourse);

      // then
      assert.ok(saveStub.called);
      assert.ok(controller.notifications.error.calledWith('Une erreur est survenue.'));
    });

    test('it should display not selected target profile error notification when autonomous-course is saved without target profile', async function (assert) {
      // given

      const autonomousCourse = {
        internalTitle: 'un nom interne',
        publicTitle: 'un nom public',
        customLandingPageText: "un texte de page d'accueil",
      };

      controller.notifications = {
        error: sinon.stub(),
      };

      const saveStub = sinon.stub().rejects();

      controller.store.createRecord = sinon.stub().returns({ save: saveStub });

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.createAutonomousCourse(event, autonomousCourse);

      // then
      assert.ok(saveStub.called);
      assert.ok(controller.notifications.error.calledWith('Aucun profil cible sélectionné !'));
    });
  });
});
