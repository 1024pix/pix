import { click, find } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Giving feedback about a challenge', function() {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let firstChallenge;

  beforeEach(function() {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    firstChallenge = server.create('challenge', 'forCompetenceEvaluation');
    server.create('challenge', 'forCompetenceEvaluation');
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

    beforeEach(function() {
    });

    it('should be able to directly send a feedback', async () => {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${firstChallenge.id}`);
      assertThatFeedbackPanelExist();
    });

    it('should always reset the feedback form between two consecutive challenges', async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${firstChallenge.id}`);
      assertThatFeedbackFormIsClosed();
      await click('.feedback-panel__open-link');
      assertThatFeedbackFormIsOpen();

      await click('.challenge-actions__action-skip');
      assertThatFeedbackFormIsClosed();
    });
  });

  describe('From the comparison modal at the end of the test', function() {

    it('should be able to give feedback', async () => {
      // given
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${firstChallenge.id}`);
      await click('.challenge-actions__action-skip');
      await click('.challenge-actions__action-skip');

      // when
      await click('.result-item__correction-button');

      // then
      assertThatFeedbackFormIsOpen();
    });
  });
});
