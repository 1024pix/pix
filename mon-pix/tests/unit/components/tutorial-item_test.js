import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | tutorial item', function() {
  setupTest();

  let component;
  const intl = Service.create({ t: sinon.spy() });
  const tutorial = {
    format: 'son',
    id: 'tutorialId',
  };

  beforeEach(function() {
    component = createGlimmerComponent('component:tutorial-item', { tutorial });
    component.intl = intl;
  });

  describe('#formatImageName', function() {

    ['son', 'page'].forEach((format) => {
      it(`should return the same name "${format}" to display the image`, function() {
        // given
        tutorial.format = format;
        component = createGlimmerComponent('component:tutorial-item', { tutorial });

        // when
        const result = component.formatImageName;

        // then
        expect(result).to.equal(format);
      });
    });

    it('should return "video" when format is "vidéo"', function() {
      // given
      tutorial.format = 'vidéo';
      component = createGlimmerComponent('component:tutorial-item', { tutorial });

      // when
      const result = component.formatImageName;

      // then
      expect(result).to.equal('video');
    });

    it('should return the default value "page" when is not precise format', function() {
      // given
      tutorial.format = 'site';
      component = createGlimmerComponent('component:tutorial-item', { tutorial });

      // when
      const result = component.formatImageName;

      // then
      expect(result).to.equal('page');
    });
  });

  describe('#isSaved', function() {

    it('should return false when the tutorial has not already been saved', function() {
      // when
      const result = component.isSaved;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has been saved', function() {
      // given
      component.savingStatus = 'recorded';

      // when
      const result = component.isSaved;

      // then
      expect(result).to.equal(true);
    });

  });

  describe('#isEvaluated', function() {

    it('should return false when the tutorial has not already been evaluated', function() {
      // when
      const result = component.isEvaluated;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has been evaluated', function() {
      // given
      component.evaluationStatus = 'recorded';

      // when
      const result = component.isEvaluated;

      // then
      expect(result).to.equal(true);
    });

  });

  describe('#buttonLabel', function() {

    it('should return "Enregistré" when the tutorial is not saved', function() {
      // when
      component.buttonLabel;

      // then
      sinon.assert.calledWith(intl.t, 'pages.user-tutorials.list.tutorial.actions.save.label');
    });

    it('should return "Enregistrer" when the tutorial is succesfully saved', function() {
      // given
      component.savingStatus = 'recorded';

      // when
      component.buttonLabel;

      // then
      sinon.assert.calledWith(intl.t, 'pages.user-tutorials.list.tutorial.actions.remove.label');
    });

  });

  describe('#buttonExtraInformation', function() {

    it('should return "Enregistrer dans ma liste de tutos" when the tutorial has not already been saved', function() {
      // when
      component.buttonExtraInformation;

      // then
      sinon.assert.calledWith(intl.t, 'pages.user-tutorials.list.tutorial.actions.save.extra-information');
    });

    it('should return "Retirer" when the tutorial has been saved', function() {
      // given
      component.savingStatus = 'recorded';

      // when
      component.buttonExtraInformation;

      // then
      sinon.assert.calledWith(intl.t, 'pages.user-tutorials.list.tutorial.actions.remove.extra-information');
    });

  });

  describe('#isSaveButtonDisabled', function() {

    it('should return false when the tutorial has not already been saved', function() {
      // given
      component.savingStatus = 'unrecorded';

      // when
      const result = component.isSaveButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return false when the tutorial has already been saved', function() {
      // given
      component.savingStatus = 'recorded';

      // when
      const result = component.isSaveButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the save/unsave operation is in progress', function() {
      // given
      component.savingStatus = 'pending';

      // when
      const result = component.isSaveButtonDisabled;

      // then
      expect(result).to.equal(true);
    });

  });

  describe('#saveTutorial', function() {
    let store;
    let userTutorial;

    beforeEach(() => {
      userTutorial = { save: sinon.stub().resolves(null) };
      store = { createRecord: sinon.stub().returns(userTutorial) };
      component.store = store;
    });

    it('should create user tutorial in store', async function() {
      // when
      await component.saveTutorial();

      // then
      sinon.assert.calledWith(store.createRecord, 'userTutorial', { tutorial });
    });

    it('should save user tutorial', async function() {
      // when
      await component.saveTutorial();

      // then
      sinon.assert.calledWith(userTutorial.save, { adapterOptions: { tutorialId: tutorial.id } });
    });

    it('should set status to recorded', async function() {
      // when
      await component.saveTutorial();

      // then
      expect(component.savingStatus).to.equal('recorded');
    });

    it('should link tutorial and userTutorial', async function() {
      // when
      await component.saveTutorial();

      // then
      expect(userTutorial.tutorial).to.equal(tutorial);
    });
  });

  describe('#removeTutorial', function() {
    let store;
    let userTutorial;

    beforeEach(() => {
      userTutorial = { id: 'userTutorialId', destroyRecord: sinon.stub().resolves(null) };
      tutorial.userTutorial = userTutorial;
      store = { peekRecord: sinon.stub().returns(userTutorial) };
      component.store = store;
      component.currentUser = { user: { id: 'userId' } };
    });

    it('should destroy user tutorial record', async function() {
      // when
      await component.removeTutorial();

      // then
      sinon.assert.calledWith(userTutorial.destroyRecord, { adapterOptions: { tutorialId: tutorial.id } });
    });

    it('should set status to unrecorded', async function() {
      // when
      await component.removeTutorial();

      // then
      expect(component.savingStatus).to.equal('unrecorded');
    });

  });

  describe('#evaluateTutorial', function() {
    let store;
    let tutorialEvaluation;

    beforeEach(() => {
      tutorialEvaluation = { save: sinon.stub().resolves(null) };
      store = { createRecord: sinon.stub().returns(tutorialEvaluation) };
      component.store = store;
    });

    it('should create tutorial evaluation in store', async function() {
      // when
      await component.evaluateTutorial();

      // then
      sinon.assert.calledWith(store.createRecord, 'tutorialEvaluation', { tutorial });
    });

    it('should save tutorial evaluation', async function() {
      // when
      await component.evaluateTutorial();

      // then
      sinon.assert.calledWith(tutorialEvaluation.save, { adapterOptions: { tutorialId: tutorial.id } });
    });

    it('should set status to recorded', async function() {
      // when
      await component.evaluateTutorial();

      // then
      expect(component.evaluationStatus).to.equal('recorded');
    });

    it('should link tutorial and tutorialEvaluation', async function() {
      // when
      await component.evaluateTutorial();

      // then
      expect(tutorialEvaluation.tutorial).to.equal(tutorial);
    });
  });

  describe('#isEvaluateButtonDisabled', function() {

    it('should return false when the tutorial has not already been evaluated', function() {
      // given
      component.evaluationStatus = 'unrecorded';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has already been evaluated', function() {
      // given
      component.evaluationStatus = 'recorded';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(true);
    });

    it('should return true when the evaluate operation is in progress', function() {
      // given
      component.evaluationStatus = 'pending';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(true);
    });

  });

});
