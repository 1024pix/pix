import { click, find, findAll } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Compare answers and solutions for QCM questions', function() {
  setupApplicationTest();
  setupMirage();
  let assessment;

  beforeEach(function() {
    defaultScenario(this.server);
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    let challenge = server.create('challenge', 'forCompetenceEvaluation', 'QCU');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QCM');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCM');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
    challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCMind');
    server.create('answer', {
      value: 'SomeAnswer',
      result: 'ko',
      challenge,
      assessment,
    });
  });

  describe('From the results page', function() {

    it('should display the REPONSE link from the results screen for all known types of question', async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/results`);
      expect(findAll('.result-item')[0].textContent).to.contain('Réponses et tutos'); //QCU
      expect(findAll('.result-item')[1].textContent).to.contain('Réponses et tutos'); //QCM
      expect(findAll('.result-item')[2].textContent).to.contain('Réponses et tutos'); //QROC
      expect(findAll('.result-item')[3].textContent).not.to.contain('Réponses et tutos'); //QROCM
      expect(findAll('.result-item')[4].textContent).to.contain('Réponses et tutos'); //QROCMind
    });
  });

  describe('Content of the correction modal', function() {

    it('should be able to open the correction modal', async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/results`);
      expect(find('.comparison-window')).to.not.exist;

      await click('.result-item__correction-button');
      expect(find('.comparison-window')).to.exist;
    });
  });

  describe('Content of the correction modal: results and instructions', function() {

    it('should check the presence of instruction, text and image', async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/results`);
      await click('.result-item__correction-button');

      expect(find('.comparison-window--body .challenge-statement__instruction')).to.exist;
      expect(find('.comparison-window--body .challenge-statement__illustration-section')).to.exist;
    });
  });
});
