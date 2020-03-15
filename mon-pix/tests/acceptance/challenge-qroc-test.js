import { click, find, findAll, fillIn } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Displaying a QROC', function() {
  setupApplicationTest();
  setupMirage();
  let assessment;
  let qrocChallenge;

  beforeEach(async function() {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    qrocChallenge = server.create('challenge', 'forCompetenceEvaluation', 'QROC');
  });

  context('Challenge answered: the answers inputs should be disabled', function() {
    beforeEach(async function() {
      server.create('answer', {
        value: 'Bill',
        result: 'ko',
        challenge: qrocChallenge,
        assessment,
      });

      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${qrocChallenge.id}`);
    });

    it('should fill inputs corresponding to the answer', async function() {
      expect(find('.challenge-response__proposal').value).to.equal('Bill');
      expect(find('.challenge-response__proposal').disabled).to.be.true;
    });

  });

  context('Challenge not answered', function() {
    beforeEach(async function() {
      await visitWithAbortedTransition(`/assessments/${assessment.id}/challenges/${qrocChallenge.id}`);
    });

    it('should render the challenge instruction', function() {
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(qrocChallenge.instruction);
    });

    it('should display only one input text as proposal to user', function() {
      expect(findAll('.challenge-response__proposal')).to.have.lengthOf(1);
      expect(find('.challenge-response__proposal').disabled).to.be.false;
    });

    it('should display the error alert if the users tries to validate an empty answer', async function() {
      await fillIn('input[data-uid="qroc-proposal-uid"]', '');
      expect(find('.alert')).to.not.exist;
      await click(find('.challenge-actions__action-validate'));

      expect(find('.alert')).to.exist;
      expect(find('.alert').textContent.trim()).to.equal('Pour valider, saisir une réponse. Sinon, passer.');
    });

  });

});
