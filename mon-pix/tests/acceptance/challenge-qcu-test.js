import { click, find, findAll } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

async function visitTimedChallengeNotYetAnswered() {
  await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id_not_yet_answered');
}

async function visitTimedChallengeAlreadyAnswered() {
  await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
}

describe('Acceptance | Displaying a QCU', function() {
  setupApplicationTest();
  setupMirage();

  context('Challenge asked for the first time', () => {
    beforeEach(async function() {
      defaultScenario(this.server);
      await visitTimedChallengeNotYetAnswered();
    });

    it('should display a radio buttons list', async function() {
      expect(findAll('input[type=radio][name="radio"]')).to.have.lengthOf(4);
    });

    it('should display an ordered list of instructions', async function() {
      expect(findAll('.proposal-text')[0].textContent.trim()).to.equal('1ere possibilite');
      expect(findAll('.proposal-text')[1].textContent.trim()).to.equal('2eme possibilite');
      expect(findAll('.proposal-text')[2].textContent.trim()).to.equal('3eme possibilite');
      expect(findAll('.proposal-text')[3].textContent.trim()).to.equal('4eme possibilite');
    });

    it('should display the error alter box if users validates with no radio button selected', async function() {
      // given
      findAll('input[type=radio][name="radio"]')[1].checked = false;

      // when
      await click('.challenge-actions__action-validate');

      // then
      expect(find('.alert')).to.exist;
      expect(find('.alert').textContent.trim()).to.equal('Pour valider, sélectionner une réponse. Sinon, passer.');
    });

    it('should not be possible to select multiple radio buttons', async function() {
      // when
      await click(findAll('input[type=radio][name="radio"]')[1]);

      expect(findAll('input[type=radio][name="radio"]')[0].checked).to.equal(false);
      expect(findAll('input[type=radio][name="radio"]')[1].checked).to.equal(true);
      expect(findAll('input[type=radio][name="radio"]')[2].checked).to.equal(false);
      expect(findAll('input[type=radio][name="radio"]')[3].checked).to.equal(false);

      // When
      await click(findAll('.label-checkbox-proposal')[0]);

      // Then
      expect(findAll('input[type=radio][name="radio"]')[0].checked).to.equal(true);
      expect(findAll('input[type=radio][name="radio"]')[1].checked).to.equal(false);
      expect(findAll('input[type=radio][name="radio"]')[2].checked).to.equal(false);
      expect(findAll('input[type=radio][name="radio"]')[3].checked).to.equal(false);
    });

    it('should only display an error alert if the user tries to validate after having interacting once with the page', async function() {
      // given
      await click('.challenge-actions__action-validate');

      // when
      await click(findAll('.label-checkbox-proposal')[0]);

      // then
      expect(find('.alert')).to.not.exist;
    });
  });

  context('Challenge already asked (hitting back button)', () => {
    beforeEach(async function() {
      defaultScenario(this.server);
      await visitTimedChallengeAlreadyAnswered();
    });

    it('should display the previously saved selected radio button by default', async function() {
      expect(findAll('.proposal-paragraph input[type=radio][name="radio"]')[0].checked).to.be.false;
      expect(findAll('.proposal-paragraph input[type=radio][name="radio"]')[1].checked).to.be.true;
      expect(findAll('.proposal-paragraph input[type=radio][name="radio"]')[2].checked).to.be.false;
      expect(findAll('.proposal-paragraph input[type=radio][name="radio"]')[3].checked).to.be.false;
    });

    it('should disable input fields', function() {
      // Then
      expect(expect(findAll('.proposal-paragraph input[type=radio][name="radio"]')[0].disabled).to.be.true);
      expect(expect(findAll('.proposal-paragraph input[type=radio][name="radio"]')[1].disabled).to.be.true);
    });
  });

});
