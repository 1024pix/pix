import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

describe('Acceptance | Compare answers and solutions for QROC questions', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('From the results page', function() {

    beforeEach(async function() {
      await visit('/assessments/ref_assessment_id/results');
    });

    it('should display the REPONSE link from the results screen', async function() {
      expect($('.result-item .js-correct-answer').text()).to.contain('Réponses et tutos');
    });

    it('should not yet display the modal nor its content', async function() {
      expect($('.comparison-window')).to.have.lengthOf(0);
      expect($('.comparison-window__header .comparison-window__result-item-index')).to.have.lengthOf(0);
      expect($('.comparison-window__header .comparison-window__title .comparison-window__title-text')).to.have.lengthOf(0);
    });

  });

  describe('Content of the correction modal', function() {

    beforeEach(async function() {
      await visit('/assessments/ref_assessment_id/results');
      await click('.result-item:nth-child(3) .result-item__correction-button');
    });

    it('should be able to access the modal directly from the url', async function() {
      expect($('.comparison-window')).to.have.lengthOf(1);
    });

    it('should contain an instruction', async function() {
      expect($('.comparison-window--body .challenge-statement__instruction')).to.have.lengthOf(1);
    });

    it('should contain a correction zone', async function() {
      expect($('.comparison-window__corrected-answers--qroc')).to.have.lengthOf(1);
    });

    it('should contain a zone reserved for feedback panel', async function() {
      expect($('.comparison-window__feedback-panel')).to.have.lengthOf(1);
    });

    it('should contain a closing button', async function() {
      expect($('.pix-modal__close-link > a')).to.have.lengthOf(1);
    });
  });

});
