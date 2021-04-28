import { blur, click, fillIn, find } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEXTAREA = 'textarea.feedback-panel__field--content';
const DROPDOWN = '.feedback-panel__dropdown';

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

  context('From a challenge', function() {

    beforeEach(async function() {
      await visit(`/assessments/${assessment.id}/challenges/${firstChallenge.id}`);
    });

    it('should be able to directly send a feedback', async () => {
      assertThatFeedbackPanelExist();
    });

    context('when the feedback-panel button is clicked', function() {
      beforeEach(async function() {
        assertThatFeedbackFormIsClosed();
        await click('.feedback-panel__open-button');
      });

      it('should open the feedback form', function() {
        assertThatFeedbackFormIsOpen();
      });

      context('and the form is filled but not sent', function() {
        beforeEach(async function() {
          await fillIn(DROPDOWN, 'accessibility');
          await fillIn(TEXTAREA, 'TEST_CONTENT');
          await blur(TEXTAREA);
        });

        context('and the challenge is skipped', function() {

          beforeEach(async function() {
            await click('.challenge-actions__action-skip');
          });

          it('should not display the feedback form', function() {
            assertThatFeedbackFormIsClosed();
          });

          it('should always reset the feedback form between two consecutive challenges', async function() {
            await click('.feedback-panel__open-button');
            await fillIn(DROPDOWN, 'accessibility');
            expect(find(TEXTAREA).value).to.equal('');
          });
        });

      });
    });
  });

  context('From the comparison modal at the end of the test', function() {

    it('should be able to give feedback', async () => {
      // given
      server.create('answer', 'skipped', { assessment, challenge: firstChallenge });
      await visit(`/assessments/${assessment.id}/checkpoint`);

      // when
      await click('.result-item__correction-button');

      // then
      assertThatFeedbackFormIsOpen();
    });
  });
});
