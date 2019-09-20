import { click, find, findAll, fillIn } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

async function visitTimedChallengeNotYetAnswered() {
  await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qroc_challenge_id_not_yet_answered');
}

async function visitTimedChallengeAlreadyAnswered() {
  await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qroc_challenge_id');
}

describe('Acceptance | Displaying a QROC', function() {
  setupApplicationTest();
  setupMirage();

  context('Challenge asked for the first time', () => {
    beforeEach(async function() {
      defaultScenario(this.server);
      await visitTimedChallengeNotYetAnswered();
    });

    it('should render the challenge instruction', function() {
      const instructionText = 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre';
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(instructionText);
    });

    it('should display only one input text as proposal to user', function() {
      expect(findAll('.challenge-response__proposal-input')).to.have.lengthOf(1);
    });

    it('should display the error alert if the users tries to validate an empty answer', async function() {
      await fillIn('input[data-uid="qroc-proposal-uid"]', '');
      expect(find('.alert')).to.not.exist;
      await click(find('.challenge-actions__action-validate'));

      expect(find('.alert')).to.exist;
      expect(find('.alert').textContent.trim()).to.equal('Pour valider, saisir une réponse. Sinon, passer.');
    });
  });

  context('Challenge already asked (hitting back button)', () => {
    beforeEach(async function() {
      defaultScenario(this.server);
      await visitTimedChallengeAlreadyAnswered();
    });

    it('should show what was previously answered', function() {
      expect(findAll('.challenge-response__proposal-input')[0].value.length).to.be.not.empty;
    });

    it('should disable input fields', function() {
      expect(findAll('.challenge-response__proposal-input')[0].disabled).to.be.true;
    });
  });
});
