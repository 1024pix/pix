import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | Tutorial | card item', function (hooks) {
  setupTest(hooks);

  let component;
  const intl = Service.create({ t: sinon.spy() });
  const tutorial = {
    format: 'son',
    id: 'tutorialId',
  };

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:tutorials/card', { tutorial });
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
      let userTutorial;

      hooks.beforeEach(function () {
        userTutorial = { save: sinon.stub().resolves(null) };
        store = { createRecord: sinon.stub().returns(userTutorial) };
        component.store = store;
      });

      test('should create user tutorial in store', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        assert.expect(0);
        sinon.assert.calledWith(store.createRecord, 'userTutorial', { tutorial });
      });

      test('should save user tutorial', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        assert.expect(0);
        sinon.assert.called(userTutorial.save);
      });

      test('should set status to recorded', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        assert.equal(component.savingStatus, 'recorded');
      });
    });

    module('when user has already saved a tutorial', function (hooks) {
      let store;
      let userTutorial;

      hooks.beforeEach(function () {
        userTutorial = { id: 'userTutorialId', destroyRecord: sinon.stub().resolves(null) };
        tutorial.userTutorial = userTutorial;
        tutorial.unloadRecord = sinon.stub().resolves();
        component.store = store;
        component.savingStatus = 'recorded';
        component.currentUser = { user: { id: 'userId' } };
      });

      test('should destroy user tutorial record', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        assert.expect(0);
        sinon.assert.called(userTutorial.destroyRecord);
      });

      test('should set status to unrecorded', async function (assert) {
        // when
        await component.toggleSaveTutorial();

        // then
        assert.equal(component.savingStatus, 'unrecorded');
      });
    });
  });
});
