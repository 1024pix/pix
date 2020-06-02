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

  beforeEach(() => {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    timedChallenge = server.create('challenge', 'forCompetenceEvaluation', 'timed');
    notTimedChallenge = server.create('challenge', 'forCompetenceEvaluation');
  });

  describe('Timed Challenge', () => {

    beforeEach(async () => {
      // when
      await visit(`/assessments/${assessment.id}/challenges/${timedChallenge.id}`);
    });
    it('should hide the challenge statement', async () => {
      expect(find('.challenge-statement')).to.not.exist;
    });

    it('should ensure the challenge does not automatically start', async () => {
      expect(find('.timeout-jauge')).to.not.exist;
    });

    it('should ensure the feedback form is not displayed until the user has started the challenge', async () => {
      expect(find('.feedback-panel')).to.not.exist;
    });
    describe('when the confirmation button is clicked', () => {

      beforeEach(async () => {
        await click('.challenge-item-warning button');
      });

      it('should hide the warning button', () => {
        expect(find('.challenge-item-warning button')).to.not.exist;
      });

      it('should display the challenge statement and the feedback form', () => {
        expect(find('.challenge-statement')).to.exist;
        expect(find('.feedback-panel')).to.exist;
      });

      it('should start the timer', () => {
        expect(find('.timeout-jauge')).to.exist;
      });

    });
  });

  describe('Not Timed Challenge', () => {

    it('should display the challenge statement', async () => {
      // when
      await visit(`/assessments/${assessment.id}/challenges/${notTimedChallenge.id}`);

      // then
      expect(find('.challenge-statement')).to.exist;
    });
  });

});
