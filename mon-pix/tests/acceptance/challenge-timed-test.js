import { click, find } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const NOT_TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id';
const CHALLENGE_ITEM_WARNING_BUTTON = '.challenge-item-warning button';

describe('Acceptance | Timed challenge', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Displaying the challenge', function() {

    it('should hide the challenge statement', async function() {
      // When
      await visitWithAbortedTransition(TIMED_CHALLENGE_URL);

      // Then
      expect(find('.challenge-statement')).to.not.exist;
    });

    it('should display the challenge statement if the challenge is not timed', async function() {
      // When
      await visitWithAbortedTransition(NOT_TIMED_CHALLENGE_URL);

      // Then
      expect(find('.challenge-statement')).to.exist;
    });

    it('should ensure the challenge does not automatically start', async function() {
      // Given
      await visitWithAbortedTransition(TIMED_CHALLENGE_URL);

      // When
      await visitWithAbortedTransition(NOT_TIMED_CHALLENGE_URL);

      // Then
      expect(find('.timeout-jauge')).to.not.exist;
    });

    it('should ensure the feedback form is not displayed until the user has started the challenge', async function() {
      // Given
      await visitWithAbortedTransition(TIMED_CHALLENGE_URL);

      // Then
      expect(find('.feedback-panel')).to.not.exist;
    });

  });

  describe('When the confirmation button is clicked', function() {

    beforeEach(async function() {
      await visitWithAbortedTransition(TIMED_CHALLENGE_URL);
      await click(CHALLENGE_ITEM_WARNING_BUTTON);
    });

    it('should hide the warning button', function() {
      expect(find(CHALLENGE_ITEM_WARNING_BUTTON)).to.not.exist;
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
