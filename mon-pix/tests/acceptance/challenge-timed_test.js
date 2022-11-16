import { click, find, visit } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';

describe('Acceptance | Timed challenge', function () {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let timedChallenge;

  context('Timed Challenge', function () {
    context('when asking for confirmation', function () {
      beforeEach(async function () {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should hide the challenge statement', async function () {
        expect(find('.challenge-statement')).to.not.exist;
      });

      it('should ensure the challenge does not automatically start', async function () {
        expect(find('.timeout-gauge')).to.not.exist;
      });
    });

    context('when the confirmation button is clicked', function () {
      context('and the challenge has not been already answered', function () {
        beforeEach(async function () {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);
          await click('.timed-challenge-instructions button');
        });

        it('should hide the warning button', function () {
          expect(find('.timed-challenge-instructions button')).to.not.exist;
        });

        it('should display the challenge statement and the feedback form', function () {
          expect(find('.challenge-statement')).to.exist;
          expect(find('.feedback-panel')).to.exist;
        });

        it('should start the timer', function () {
          expect(find('.timeout-gauge')).to.exist;
        });
      });

      context('and the challenge has already been skipped before', function () {
        beforeEach(async function () {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');
          server.create('answer', 'skipped', {
            assessment,
            challenge: timedChallenge,
          });

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);
        });

        it('should hide the warning button', function () {
          expect(find('.timed-challenge-instructions button')).to.not.exist;
        });

        it('should display the challenge statement and the feedback form', function () {
          expect(find('.challenge-statement')).to.exist;
          expect(find('.feedback-panel')).to.exist;
        });

        it('should not display the timer', function () {
          expect(find('.timeout-gauge')).to.not.exist;
        });
      });
    });

    context('when the challenge is already timeout', function () {
      beforeEach(async function () {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType', 'withCurrentChallengeTimeout');
        timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);
      });

      it('should hide the warning button', function () {
        expect(find('.timed-challenge-instructions button')).to.not.exist;
      });

      it('should display the challenge statement and the feedback form', function () {
        expect(find('.challenge-statement')).to.exist;
        expect(find('.feedback-panel')).to.exist;
      });

      it('should display the timer without time remains', function () {
        expect(find('[data-test="timeout-gauge-remaining"]').textContent).to.contains('0:00');
      });

      it('should only display continue button', function () {
        expect(find('.challenge-actions__action-skip')).to.not.exist;
        expect(find('.challenge-actions__action-validate')).to.not.exist;
        expect(find('.challenge-actions__action-continue')).to.exist;
      });
    });
  });
  context('when user seen two timed challenge', function () {
    beforeEach(async function () {
      // given
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');
      server.create('challenge', 'forCompetenceEvaluation', 'timed');

      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);
      await click('.timed-challenge-instructions button');
      await click('.challenge-actions__action-skip');
    });

    it('should hide the challenge statement of the second challenge', async function () {
      expect(find('.challenge-statement')).to.not.exist;
    });

    it('should ensure the challenge does not automatically start of the second challenge', async function () {
      expect(find('.timeout-gauge')).to.not.exist;
    });
  });

  context('Not Timed Challenge', function () {
    beforeEach(function () {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      server.create('challenge', 'forCompetenceEvaluation');
    });

    it('should display the challenge statement', async function () {
      // when
      await visit(`/assessments/${assessment.id}/challenges/0`);

      // then
      expect(find('.challenge-statement')).to.exist;
    });
  });
});
