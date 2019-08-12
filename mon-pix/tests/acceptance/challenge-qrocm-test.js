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
    await visitWithAbortedTransition('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
  });

  it('should render the challenge instruction', function() {
    const instructionText = 'Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre';
    expect(find('.challenge-statement__instruction').textContent.trim()).to.equal(instructionText);
  });

  it('should display only one input text as proposal to user', function() {
    expect(findAll('.challenge-response__proposal-input')).to.have.lengthOf(3);
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
