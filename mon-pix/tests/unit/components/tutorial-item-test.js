import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Component | tutorial item', function() {
  setupTest();

  let component;
  const tutorial = {
    format: 'son',
    id: 'tutorialId'
  };
  beforeEach(function() {
    component = this.owner.lookup('component:tutorial-item');
    component.tutorial = tutorial;
  });

  describe('#formatImageName', function() {

    ['son', 'page'].forEach((format) => {
      it(`should return the same name "${format}" to display the image`, function() {
        // given
        tutorial.format = format;
        component.tutorial = tutorial;

        // when
        const result = component.formatImageName;

        // then
        expect(result).to.equal(format);
      });
    });

    it('should return "video" when format is "vidéo"', function() {
      // given
      tutorial.format = 'vidéo';
      component.tutorial = tutorial;

      // when
      const result = component.formatImageName;

      // then
      expect(result).to.equal('video');
    });

    it('should return the default value "page" when is not precise format', function() {
      // given
      tutorial.format = 'site';
      component.tutorial = tutorial;

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

  describe('#saveButtonText', function() {

    it('should return "Enregistré" when the tutorial is not saved', function() {
      // when
      const result = component.saveButtonText;

      // then
      expect(result).to.equal('Enregistrer');
    });

    it('should return "Enregistrement en cours ..." when the tutorial saving is in progress', function() {
      // given
      component.status = 'saving';

      // when
      const result = component.saveButtonText;

      // then
      expect(result).to.equal('Enregistrement en cours ...');
    });

    it('should return "Enregistrer" when the tutorial is succesfully saved', function() {
      // given
      component.status = 'saved';

      // when
      const result = component.saveButtonText;

      // then
      expect(result).to.equal('Enregistré');
    });

  });

  describe('#saveButtonTitle', function() {

    it('should return "Enregistrer dans ma liste de tutos" when the tutorial has not already been saved', function() {
      // when
      const result = component.saveButtonTitle;

      // then
      expect(result).to.equal('Enregistrer dans ma liste de tutos');
    });

    it('should return "Tuto déjà enregistré" when the tutorial has been saved', function() {
      // given
      component.status = 'saved';

      // when
      const result = component.saveButtonTitle;

      // then
      expect(result).to.equal('Tuto déjà enregistré');
    });

  });

  describe('#isSaveButtonDisabled', function() {

    it('should return false when the tutorial has not already been saved', function() {
      // when
      const result = component.isSaveButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has been saved', function() {
      // given
      component.status = 'saved';

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

    it('should set status to saved', async function() {
      // when
      await component.saveTutorial();

      // then
      expect(component.status).to.equal('saved');
    });

  });

});
