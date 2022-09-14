import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | Tutorial | card item', function () {
  setupTest();

  let component;
  const intl = Service.create({ t: sinon.spy() });
  const tutorial = {
    format: 'son',
    id: 'tutorialId',
  };

  beforeEach(function () {
    component = createGlimmerComponent('component:tutorials/card', { tutorial });
    component.intl = intl;
  });

  describe('#isTutorialEvaluated', function () {
    it('should return false when the tutorial has not already been evaluated', function () {
      // given
      component.evaluationStatus = 'unrecorded';

      // when
      const result = component.isTutorialEvaluated;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has already been evaluated', function () {
      // given
      component.evaluationStatus = 'recorded';

      // when
      const result = component.isTutorialEvaluated;

      // then
      expect(result).to.equal(true);
    });

    it('should return true when the evaluate operation is in progress', function () {
      // given
      component.evaluationStatus = 'pending';

      // when
      const result = component.isTutorialEvaluated;

      // then
      expect(result).to.equal(true);
    });
  });

  describe('#isTutorialSaved', function () {
    it('should return false when the tutorial has not already been saved', function () {
      // given
      component.savingStatus = 'unrecorded';

      // when
      const result = component.isTutorialSaved;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has already been saved', function () {
      // given
      component.savingStatus = 'recorded';

      // when
      const result = component.isTutorialSaved;

      // then
      expect(result).to.equal(true);
    });

    it('should return true when saving is in progress', function () {
      // given
      component.savingStatus = 'pending';

      // when
      const result = component.isTutorialSaved;

      // then
      expect(result).to.equal(true);
    });
  });

  describe('#isSaved', function () {
    it('should return false when the tutorial has not already been saved', function () {
      // when
      const result = component.isSaved;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has been saved', function () {
      // given
      component.savingStatus = 'recorded';

      // when
      const result = component.isSaved;

      // then
      expect(result).to.equal(true);
    });
  });

  describe('#toggleSaveTutorial', function () {
    describe('when user has not saved a tutorial', function () {
      let store;
      let userSavedTutorial;

      beforeEach(() => {
        userSavedTutorial = { save: sinon.stub().resolves(null) };
        store = { createRecord: sinon.stub().returns(userSavedTutorial) };
        component.store = store;
      });

      it('should create user tutorial in store', async function () {
        // when
        await component.toggleSaveTutorial();

        // then
        sinon.assert.calledWith(store.createRecord, 'userSavedTutorial', { tutorial });
      });

      it('should save user tutorial', async function () {
        // when
        await component.toggleSaveTutorial();

        // then
        sinon.assert.called(userSavedTutorial.save);
      });

      it('should set status to recorded', async function () {
        // when
        await component.toggleSaveTutorial();

        // then
        expect(component.savingStatus).to.equal('recorded');
      });
    });

    describe('when user has already saved a tutorial', function () {
      let store;
      let userSavedTutorial;

      beforeEach(() => {
        userSavedTutorial = { id: 'userSavedTutorialId', destroyRecord: sinon.stub().resolves(null) };
        tutorial.userSavedTutorial = userSavedTutorial;
        tutorial.unloadRecord = sinon.stub().resolves();
        component.store = store;
        component.savingStatus = 'recorded';
        component.currentUser = { user: { id: 'userId' } };
      });

      it('should destroy user tutorial record', async function () {
        // when
        await component.toggleSaveTutorial();

        // then
        sinon.assert.called(userSavedTutorial.destroyRecord);
      });

      it('should set status to unrecorded', async function () {
        // when
        await component.toggleSaveTutorial();

        // then
        expect(component.savingStatus).to.equal('unrecorded');
      });
    });
  });
});
