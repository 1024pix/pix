import { click, fillIn, find, findAll } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Displaying un QROCM', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(async function() {
    defaultScenario(this.server);
  });

  context('Challenge answered: the answers inputs should be disabled', function() {
    beforeEach(async function() {
      server.create('assessment', {
        id: 'ref_assessment_id'
      });

      server.create('answer', {
        value: 'logiciel1: \'Linux\'\nlogiciel2: \'Open Office\'\nlogiciel3: \'Pix\'\n',
        result: 'ko',
        challengeId: 'ref_qrocm_challenge_id',
        assessmentId: 'ref_assessment_id',
      });

      await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
    });

    it('should fill inputs with previously given answer', async function() {
      expect(findAll('.challenge-response__proposal')[0].value).to.equal('Linux');
      expect(findAll('.challenge-response__proposal')[1].value).to.equal('Open Office');
      expect(findAll('.challenge-response__proposal')[2].value).to.equal('Pix');

      findAll('.challenge-response__proposal').forEach((input) => expect(input.disabled).to.equal(true));
    });

  });

  context('Challenge not answered', function() {
    beforeEach(async function() {
      await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
    });

    it('should render the challenge instruction', function() {
      const instructionText = 'Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre';
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(instructionText);
    });

    it('should display several inputs as proposal to user', function() {
      expect(findAll('.challenge-response__proposal')).to.have.lengthOf(3);
    });

    it('should display an error alert if the user tried to validate without checking anything first', async function() {
      await fillIn(findAll('input')[0], '');
      await fillIn(findAll('input')[1], '');
      await fillIn(findAll('input')[2], '');

      await click(find('.challenge-actions__action-validate'));

      expect(find('.alert')).to.exist;
      expect(find('.alert').textContent.trim()).to.equal('Pour valider, saisir au moins une réponse. Sinon, passer.');
    });
  });

});
