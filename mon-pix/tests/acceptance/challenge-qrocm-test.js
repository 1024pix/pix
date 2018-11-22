import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

describe('Acceptance | Displaying un QROCM', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visit('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should render the challenge instruction', function() {
    const $challengeInstruction = $('.challenge-statement__instruction');
    const instructiontext = 'Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre';
    expect($challengeInstruction.text().trim()).to.equal(instructiontext);
  });

  it('should display only one input text as proposal to user', function() {
    expect($('.challenge-response__proposal-input')).to.have.lengthOf(3);
  });

  it('should display an error alert if the user tried to validate without checking anything first', async function() {
    $(':input').val('');
    await click($('.challenge-actions__action-validate'));

    expect($('.alert')).to.have.lengthOf(1);
    expect($('.alert').text().trim()).to.equal('Pour valider, saisir au moins une réponse. Sinon, passer.');
  });
});
