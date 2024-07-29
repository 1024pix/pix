import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | Tutorial | card item', function (hooks) {
  setupTest(hooks);

  let component;
  const intl = Service.create({ t: sinon.spy() });
  const tutorial = {
    format: 'son',
    id: 'tutorialId',
  };

  hooks.beforeEach(function () {
    component = createGlimmerComponent('tutorials/card', { tutorial });
    component.intl = intl;
  });

  module('#isTutorialEvaluated', function () {
    test('should return false when the tutorial has not already been evaluated', function (assert) {
      // given
      component.evaluationStatus = 'unrecorded';

      // when
      const result = component.isTutorialEvaluated;

      // then
      assert.false(result);
    });

    test('should return true when the tutorial has already been evaluated', function (assert) {
      // given
      component.evaluationStatus = 'recorded';

      // when
      const result = component.isTutorialEvaluated;

      // then
      assert.true(result);
    });

    test('should return true when the evaluate operation is in progress', function (assert) {
      // given
      component.evaluationStatus = 'pending';

      // when
      const result = component.isTutorialEvaluated;

      // then
      assert.true(result);
    });
  });

  module('#isTutorialSaved', function () {
    test('should return false when the tutorial has not already been saved', function (assert) {
      // given
      component.savingStatus = 'unrecorded';

      // when
      const result = component.isTutorialSaved;

      // then
      assert.false(result);
    });

    test('should return true when the tutorial has already been saved', function (assert) {
      // given
      component.savingStatus = 'recorded';

      // when
      const result = component.isTutorialSaved;

      // then
      assert.true(result);
    });

    test('should return true when saving is in progress', function (assert) {
      // given
      component.savingStatus = 'pending';

      // when
      const result = component.isTutorialSaved;

      // then
      assert.true(result);
    });
  });

  module('#isSaved', function () {
    test('should return false when the tutorial has not already been saved', function (assert) {
      // when
      const result = component.isSaved;

      // then
      assert.false(result);
    });

    test('should return true when the tutorial has been saved', function (assert) {
      // given
      component.savingStatus = 'recorded';

      // when
      const result = component.isSaved;

      // then
      assert.true(result);
    });
  });

  module('#toggleSaveTutorial', function () {
    module('when user has not saved a tutorial', function (hooks) {
      let store;
      let userSavedTutorial;

      hooks.beforeEach(() => {
        userSavedTutorial = { save: sinon.stub().resolves(null) };
        store = { createRecord: sinon.stub().returns(userSavedTutorial) };
        component.store = store;
      });

      test('should create user tutorial in store', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        sinon.assert.calledWith(store.createRecord, 'userSavedTutorial', { tutorial });
        assert.ok(true);
      });

      test('should save user tutorial', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        sinon.assert.called(userSavedTutorial.save);
        assert.ok(true);
      });

      test('should set status to recorded', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        assert.strictEqual(component.savingStatus, 'recorded');
      });
    });

    module('when user has already saved a tutorial', function (hooks) {
      let store;
      let userSavedTutorial;

      hooks.beforeEach(() => {
        userSavedTutorial = { id: 'userSavedTutorialId', destroyRecord: sinon.stub().resolves(null) };
        tutorial.userSavedTutorial = userSavedTutorial;
        tutorial.unloadRecord = sinon.stub().resolves();
        component.store = store;
        component.savingStatus = 'recorded';
        component.currentUser = { user: { id: 'userId' } };
      });

      test('should destroy user tutorial record', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        sinon.assert.called(userSavedTutorial.destroyRecord);
        assert.ok(true);
      });

      test('should set status to unrecorded', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        assert.strictEqual(component.savingStatus, 'unrecorded');
      });
    });
  });

  module('#linkRel', function () {
    test('should return noreferrer if unknown destination link', function (assert) {
      // given
      component = createGlimmerComponent('tutorials/card', { tutorial: { ...tutorial, link: 'https://exemple.net/' } });

      // when
      const result = component.linkRel;

      // then
      assert.strictEqual(result, 'noreferrer');
    });

    test('should return empty string if tutorial.pix.fr', function (assert) {
      // given
      component = createGlimmerComponent('tutorials/card', {
        tutorial: { ...tutorial, link: 'https://tutorial.pix.fr:443/known-link' },
      });

      // when
      const result = component.linkRel;

      // then
      assert.strictEqual(result, null);
    });
  });

  module('#trackAccess', function () {
    test('should push event on click', function (assert) {
      // given
      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();
      const tutorialTitle = 'Mon super tutoriel';
      component = createGlimmerComponent('tutorials/card', {
        tutorial: { ...tutorial, title: tutorialTitle, link: 'https://exemple.net/' },
      });
      const currentRouteName = 'current.route.name';
      component.router = { currentRouteName };

      // when
      component.trackAccess();

      // then
      sinon.assert.calledWithExactly(metrics.add, {
        event: 'custom-event',
        'pix-event-category': 'Accès tuto',
        'pix-event-action': `Click depuis : ${currentRouteName}`,
        'pix-event-name': `Ouvre le tutoriel : ${tutorialTitle}`,
      });
      assert.ok(true);
    });
  });
});
