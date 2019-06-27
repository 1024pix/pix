import { click, find } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Giving feedback about a challenge', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  function assertThatFeedbackPanelExist() {
    expect(find('.feedback-panel')).to.exist;
  }

  function assertThatFeedbackFormIsClosed() {
    expect(find('.feedback-panel__form')).to.not.exist;
  }

  function assertThatFeedbackFormIsOpen() {
    expect(find('.feedback-panel__form')).to.exist;
  }

  describe('From a challenge', function() {

    it('should be able to directly send a feedback', async () => {
      await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      assertThatFeedbackPanelExist();
    });

    it('should always reset the feedback form between two consecutive challenges', async () => {
      // In our Mirage data set, in the "ref course", the QCU challenge is followed by a QRU's one
      await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      assertThatFeedbackFormIsClosed();

      await click('.feedback-panel__open-link');
      assertThatFeedbackFormIsOpen();

      await click('.challenge-actions__action-skip');
      await click('.challenge-item-warning button');
      assertThatFeedbackFormIsClosed();
    });
  });

  describe('From the comparison modal', function() {

    it('should be able to give feedback', async () => {
      await visitWithAbortedTransition('/assessments/ref_assessment_id/results');
      await click('.result-item__correction-button');
      assertThatFeedbackFormIsOpen();
    });
  });
});
