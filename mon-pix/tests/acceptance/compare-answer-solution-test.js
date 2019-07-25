import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

// see http://stackoverflow.com/a/7349478/2595513
function charCount(str) {
  return str.match(/[a-zA-Z]/g).length;
}

describe('Compare answers and solutions for QCM questions', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  const RESULT_URL = '/assessments/ref_assessment_id/results';

  describe('From the results page', function() {

    it('should display the REPONSE link from the results screen for QCM  and QCU questions', async function() {
      await visit(RESULT_URL);
      expect($('.result-item:eq(0) .js-correct-answer').text()).to.contain('Réponses et tutos'); //QCM
      expect($('.result-item:eq(1) .js-correct-answer').text()).to.contain('Réponses et tutos'); //QCU
      expect($('.result-item:eq(2) .js-correct-answer').text()).to.contain('Réponses et tutos'); //QROC
      expect($('.result-item:eq(3) .js-correct-answer').text()).not.to.contain('Réponses et tutos'); //QROCM
    });
  });

  describe('Content of the correction modal', function() {

    it('should be able to open the correction modal', async function() {
      await visit(RESULT_URL);
      expect($('.comparison-window')).to.have.lengthOf(0);

      await click('.result-item__correction-button');
      expect($('.comparison-window')).to.have.lengthOf(1);
    });
  });

  describe('Content of the correction modal: results and instructions', function() {

    it('should check the presence of instruction, text and image', async function() {
      const TEXT_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__instruction';
      const IMAGE_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__illustration-section';

      await visit(RESULT_URL);
      expect($(TEXT_OF_INSTRUCTION_SELECTOR)).to.exist;
      expect($(IMAGE_OF_INSTRUCTION_SELECTOR)).to.exist;

      await click('.result-item__correction-button');
      expect(charCount($(TEXT_OF_INSTRUCTION_SELECTOR).text())).to.be.above(5);// XXX : Above 5 means "must be a sentence"
      expect($(IMAGE_OF_INSTRUCTION_SELECTOR)).to.have.lengthOf(1);
    });
  });
});
