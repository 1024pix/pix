import { click, find } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import visit from '../helpers/visit';

describe('Acceptance | Timed challenge', () => {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let timedChallenge;
  let notTimedChallenge;

  context('Timed Challenge', function() {

    context('when asking for confirmation', function() {

      beforeEach(async () => {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

        // when
        await visit(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);
      });

      it('should hide the challenge statement', async () => {
        expect(find('.challenge-statement')).to.not.exist;
      });

      it('should ensure the challenge does not automatically start', async () => {
        expect(find('.timeout-gauge')).to.not.exist;
      });
    });

    context('when the confirmation button is clicked', function() {

      context('and the challenge has not been already answered', function() {

        beforeEach(async () => {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');

          // when
          await visit(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);
          await click('.timed-challenge-instructions button');
        });

        it('should hide the warning button', () => {
          expect(find('.timed-challenge-instructions button')).to.not.exist;
        });

        it('should display the challenge statement and the feedback form', () => {
          expect(find('.challenge-statement')).to.exist;
          expect(find('.feedback-panel')).to.exist;
        });

        it('should start the timer', () => {
          expect(find('.timeout-gauge')).to.exist;
        });

      });

      context('and the challenge has already been skipped before', function() {

        beforeEach(async () => {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');
          server.create('answer', 'skipped', {
            assessment,
            challenge: timedChallenge,
          });

          // when
          await visit(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);
        });

        it('should hide the warning button', () => {
          expect(find('.timed-challenge-instructions button')).to.not.exist;
        });

        it('should display the challenge statement and the feedback form', () => {
          expect(find('.challenge-statement')).to.exist;
          expect(find('.feedback-panel')).to.exist;
        });

        it('should not display the timer', () => {
          expect(find('.timeout-gauge')).to.not.exist;
        });

      });

    });
  });

  context('Not Timed Challenge', function() {

    beforeEach(() => {
      assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      notTimedChallenge = server.create('challenge', 'forCompetenceEvaluation');
    });

    it('should display the challenge statement', async () => {
      // when
      await visit(`/assessments/${assessment.id}/challenges/${notTimedChallenge.id}`);

      // then
      expect(find('.challenge-statement')).to.exist;
    });
  });

});
