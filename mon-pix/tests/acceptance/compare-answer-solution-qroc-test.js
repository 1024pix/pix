import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

describe('Acceptance | Compare answers and solutions for QROC questions', function() {

  const RESULT_URL = '/assessments/ref_assessment_id/results';
  const COMPARISON_MODAL_URL = '/assessments/ref_assessment_id/results/compare/ref_answer_qroc_id/4';

  const TEXT_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__title .comparison-window__title-text';
  const INDEX_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__result-item-index';
  const TEXT_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__instruction';
  const CORRECTION_BOX_QROC = '.comparison-window__corrected-answers--qroc';
  const FEEDBACK_PANEL = '.comparison-window__feedback-panel';

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('From the results page', function() {

    beforeEach(async function() {
      await visit(RESULT_URL);
    });

    it('should display the REPONSE link from the results screen', async function() {
      expect($('.result-item .js-correct-answer').text()).to.contain('RÉPONSE');
    });

    it('should not yet display the modal nor its content', async function() {
      expect($('.comparison-window')).to.have.lengthOf(0);
      expect($(INDEX_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
      expect($(TEXT_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
    });

  });

  describe('Content of the correction modal', function() {

    beforeEach(async function() {
      await visit(COMPARISON_MODAL_URL);
    });

    afterEach(async function() {
      // XXX test env needs the modal to be closed manually
      if (find('.close-button-container').length > 0) {
        await click('.close-button-container');
      }
    });

    it('should be able to access the modal directly from the url', async function() {
      expect($('.comparison-window')).to.have.lengthOf(1);
    });

    it('should contain a header', async function() {
      expect($(INDEX_OF_RESULT_SELECTOR).text().replace(/\n/g, '').trim()).to.equal('4');
    });

    it('should contain an instruction', async function() {
      expect($(TEXT_OF_INSTRUCTION_SELECTOR)).to.have.lengthOf(1);
    });

    it('should contain a correction zone', async function() {
      expect($(CORRECTION_BOX_QROC)).to.have.lengthOf(1);
    });

    it('should contain a zone reserved for feedback panel', async function() {
      expect($(FEEDBACK_PANEL)).to.have.lengthOf(1);
    });

    it('should contain a closing button', async function() {
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });
  });

});
