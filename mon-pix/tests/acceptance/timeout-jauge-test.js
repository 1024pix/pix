import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TIMED_CHALLENGE_URI = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const CHALLENGE_ITEM_WARNING_BUTTON = '.challenge-item-warning button';

async function visitTimedChallenge() {
  await visitWithAbortedTransition(TIMED_CHALLENGE_URI);
  await click(find(CHALLENGE_ITEM_WARNING_BUTTON));
}

describe('Acceptance | Timeout Gauge', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Displaying the gauge', function() {
    //XXX: Deux cas car on test aussi une absence d'affichage
    it('should only display the gauge if required', async function() {
      await visitTimedChallenge();
      expect(find('.timeout-jauge')).to.exist;
      await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      expect(find('.timeout-jauge')).to.not.exist;
    });
  });
});
