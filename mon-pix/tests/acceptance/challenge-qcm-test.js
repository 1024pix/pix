import { click, find, findAll } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

async function visitTimedChallengeNotYetAnswered() {
  await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id_not_yet_answered');
  await click('.challenge-item-warning button');
}

async function visitTimedChallengeAlreadyAnswered() {
  await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  await click('.challenge-item-warning button');
}

describe('Acceptance | Displaying a QCM', function() {
  setupApplicationTest();
  setupMirage();

  context('Challenge asked for the first time', function() {

    beforeEach(async function() {
      defaultScenario(this.server);
      await visitTimedChallengeNotYetAnswered();
    });

    it('should render challenge instruction', function() {
      // Given
      const expectedInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs';

      // Then
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(expectedInstruction);
    });

    it('should format content written as [foo](bar) as clickable link', function() {
      expect(find('.challenge-statement__instruction a')).to.exist;
      expect(find('.challenge-statement__instruction a').textContent).to.equal('plusieurs');
      expect(find('.challenge-statement__instruction a').getAttribute('href')).to.equal('http://link.plusieurs.url');
    });

    it('should open the links in a new tab', function() {
      expect(find('.challenge-statement__instruction a').getAttribute('target')).to.equal('_blank');
    });

    it('should render a list of checkboxes', function() {
      expect(findAll('input[type="checkbox"]')).to.have.lengthOf(4);
    });

    it('should mark checkboxes that have been checked', async function() {
      await click(findAll('input[type="checkbox"]')[0]);
      await click(findAll('input[type="checkbox"]')[1]);

      expect(findAll('input[type="checkbox"]')[0].checked).to.be.true;
      expect(findAll('input[type="checkbox"]')[1].checked).to.be.true;
      expect(findAll('input[type="checkbox"]')[3].checked).to.be.false;
    });

    it('should render an ordered list of instruction', function() {
      expect(findAll('.proposal-text')[0].textContent.trim()).to.equal('possibilite 1, et/ou');
      expect(findAll('.proposal-text')[1].textContent.trim()).to.equal('possibilite 2, et/ou');
      expect(findAll('.proposal-text')[2].textContent.trim()).to.equal('possibilite 3, et/ou');
      expect(findAll('.proposal-text')[3].textContent.trim()).to.equal('possibilite 4');
    });

    it('should hide the error alert box by default', function() {
      expect(find('.alert')).to.not.exist;
    });

    it('should show validate button', function() {
      // Then
      expect(expect(findAll('.challenge-actions__action-validate')).to.exist);
    });

    it('should display the alert box if user validates without checking a checkbox', async function() {
      // When
      await click('.challenge-actions__action-validate');

      expect(find('.alert')).to.exist;
      expect(find('.alert').textContent.trim()).to.equal('Pour valider, sélectionner au moins une réponse. Sinon, passer.');
    });

    it('should set the checkbox state as checked when user checks a checkbox', async function() {
      expect(findAll('input[type="checkbox"]')[0].checked).to.be.false;
      await click(findAll('.proposal-text')[0]);
      expect(findAll('input[type="checkbox"]')[0].checked).to.be.true;
    });

    it('should not alter a checkbox state when siblings checkboxes are checked', async function() {
      expect(findAll('input[type="checkbox"]')[0].checked).to.be.false;
      expect(findAll('input[type="checkbox"]')[1].checked).to.be.false;
      await click(findAll('.proposal-text')[2]);
      expect(findAll('input[type="checkbox"]')[0].checked).to.be.false;
      expect(findAll('input[type="checkbox"]')[1].checked).to.be.false;
    });

    it('should hide the error message after the user has clicked a checkbox', async function() {
      await click('.challenge-actions__action-validate');

      // when
      await click(findAll('.proposal-text')[1]);

      // then
      expect(find('.alert')).to.not.exist;
    });
  });

  context('Challenge already asked (hitting back button)', function() {
    beforeEach(async function() {
      defaultScenario(this.server);
      await visitTimedChallengeAlreadyAnswered();
    });

    it('should show what was previously answered', function() {
      // Then
      expect(expect(findAll('input[type="checkbox"]')[0].checked).to.be.false);
      expect(expect(findAll('input[type="checkbox"]')[1].checked).to.be.true);
      expect(expect(findAll('input[type="checkbox"]')[2].checked).to.be.false);
      expect(expect(findAll('input[type="checkbox"]')[3].checked).to.be.true);
    });

    it('should show resume button (instead of submit button)', function() {
      // Then
      expect(expect(find('.challenge-actions__already-answered')).to.exist);
      expect(expect(find('.challenge-actions__action-continue')).to.exist);
      expect(expect(find('.challenge-actions__action-validate')).to.not.exist);
    });

    it('should disable input fields', function() {
      // Then
      expect(expect(findAll('input[type="checkbox"]')[0].disabled).to.be.true);
      expect(expect(findAll('input[type="checkbox"]')[1].disabled).to.be.true);
    });
  });

});
