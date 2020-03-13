import { click, find, } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Compare answers and solutions for QROC questions', function() {
  setupApplicationTest();
  setupMirage();
  let assessment;

  beforeEach(function() {
    defaultScenario(this.server);
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    const challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
  });

  describe('From the results page', function() {

    beforeEach(async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/results`);
    });

    it('should display the REPONSE link from the results screen', async function() {
      expect(find('.result-item .js-correct-answer').textContent).to.contain('Réponses et tutos');
    });

    it('should not yet display the modal nor its content', async function() {
      expect(find('.comparison-window')).to.be.null;
      expect(find('.comparison-window__header .comparison-window__result-item-index')).to.be.null;
      expect(find('.comparison-window__header .comparison-window__title .comparison-window__title-text')).to.be.null;
    });

  });

  describe('Content of the correction modal', function() {

    beforeEach(async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/results`);
      await click('.result-item:nth-child(1) .result-item__correction-button');
    });

    it('should be able to access the modal directly from the url', async function() {
      expect(find('.comparison-window')).to.exist;
    });

    it('should contain an instruction', async function() {
      expect(find('.comparison-window--body .challenge-statement__instruction')).to.exist;
    });

    it('should contain a correction zone', async function() {
      expect(find('.comparison-window__corrected-answers--qroc')).to.exist;
    });

    it('should contain a zone reserved for feedback panel', async function() {
      expect(find('.comparison-window__feedback-panel')).to.exist;
    });

    it('should contain a closing button', async function() {
      expect(find('.pix-modal__close-link > span')).to.exist;
    });
  });

});
