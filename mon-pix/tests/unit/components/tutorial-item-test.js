import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | tutorial item', function() {
  setupTest();

  let component;
  const tutorial = {
    format: 'son',
    id: 'tutorialId'
  };
  beforeEach(function() {
    component = createGlimmerComponent('component:tutorial-item', { tutorial });
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
      component.status = 'saved';

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
      component.evaluationStatus = 'saved';

      // when
      const result = component.isEvaluated;

      // then
      expect(result).to.equal(true);
    });

  });

  describe('#buttonText', function() {

    it('should return "Enregistré" when the tutorial is not saved', function() {
      // when
      const result = component.buttonText;

      // then
      expect(result).to.equal('Enregistrer');
    });

    it('should return "Enregistrer" when the tutorial is succesfully saved', function() {
      // given
      component.status = 'saved';

      // when
      const result = component.buttonText;

      // then
      expect(result).to.equal('Retirer');
    });

  });

  describe('#buttonTitle', function() {

    it('should return "Enregistrer dans ma liste de tutos" when the tutorial has not already been saved', function() {
      // when
      const result = component.buttonTitle;

      // then
      expect(result).to.equal('Enregistrer dans ma liste de tutos');
    });

    it('should return "Retirer" when the tutorial has been saved', function() {
      // given
      component.status = 'saved';

      // when
      const result = component.buttonTitle;

      // then
      expect(result).to.equal('Retirer');
    });

  });

  describe('#isButtonDisabled', function() {

    it('should return false when the tutorial has not already been saved', function() {
      // given
      component.status = 'unsaved';

      // when
      const result = component.isButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return false when the tutorial has already been saved', function() {
      // given
      component.status = 'saved';

      // when
      const result = component.isButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the save/unsave operation is in progress', function() {
      // given
      component.status = 'saving';

      // when
      const result = component.isButtonDisabled;

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

    it('should set status to saved', async function() {
      // when
      await component.saveTutorial();

      // then
      expect(component.status).to.equal('saved');
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

    it('should set status to unsaved', async function() {
      // when
      await component.removeTutorial();

      // then
      expect(component.status).to.equal('unsaved');
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

    it('should set status to saved', async function() {
      // when
      await component.evaluateTutorial();

      // then
      expect(component.evaluationStatus).to.equal('saved');
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
      component.evaluationStatus = 'unsaved';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has already been evaluated', function() {
      // given
      component.evaluationStatus = 'saved';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(true);
    });

    it('should return true when the evaluate operation is in progress', function() {
      // given
      component.evaluationStatus = 'saving';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(true);
    });

  });

});
