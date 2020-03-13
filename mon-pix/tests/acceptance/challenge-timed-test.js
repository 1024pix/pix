import { click, find } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Timed challenge', function() {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let timedChallenge;
  let notTimedChallenge;

  beforeEach(function() {
    defaultScenario(this.server);
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');
    notTimedChallenge = server.create('challenge', 'forCompetenceEvaluation');
  });

  describe('Displaying the challenge', function() {

    it('should hide the challenge statement', async function() {
      // When
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);

      // Then
      expect(find('.challenge-statement')).to.not.exist;
    });

    it('should display the challenge statement if the challenge is not timed', async function() {
      // When
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${notTimedChallenge.id}`);

      // Then
      expect(find('.challenge-statement')).to.exist;
    });

    it('should ensure the challenge does not automatically start', async function() {
      // Given
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);

      // When
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${notTimedChallenge.id}`);

      // Then
      expect(find('.timeout-jauge')).to.not.exist;
    });

    it('should ensure the feedback form is not displayed until the user has started the challenge', async function() {
      // Given
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);

      // Then
      expect(find('.feedback-panel')).to.not.exist;
    });

  });

  describe('When the confirmation button is clicked', function() {

    beforeEach(async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);
      await click('.challenge-item-warning button');
    });

    it('should hide the warning button', function() {
      expect(find('.challenge-item-warning button')).to.not.exist;
    });

    it('should display the challenge statement', function() {
      expect(find('.challenge-statement')).to.exist;
    });

    it('should start the timer', function() {
      expect(find('.timeout-jauge')).to.exist;
    });

    it('should display the feedback form', function() {
      expect(find('.feedback-panel')).to.exist;
    });

  });

});
