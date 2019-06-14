import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | Giving feedback about a challenge', function() {

  let application;

  function assertThatFeedbackPanelExist() {
    expect(find('.feedback-panel')).to.have.lengthOf(1);
  }

  function assertThatFeedbackFormIsClosed() {
    expect(find('.feedback-panel__form')).to.have.lengthOf(0);
  }

  function assertThatFeedbackFormIsOpen() {
    expect(find('.feedback-panel__form')).to.have.lengthOf(1);
  }

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('From a challenge', function() {

    it('should be able to directly send a feedback', async () => {
      await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      assertThatFeedbackPanelExist();
    });

    it('should always reset the feedback form between two consecutive challenges', async () => {
      // In our Mirage data set, in the "ref course", the QCU challenge is followed by a QRU's one
      await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
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
      await visit('/assessments/ref_assessment_id/results');
      await click('.result-item__correction__button');
      assertThatFeedbackFormIsOpen();
    });
  });
});
