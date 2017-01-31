import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | b4 - Afficher un QROCM | ', function () {

  let application;

  beforeEach(function () {
    application = startApp();
    visit('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('b4.1 It should render challenge instruction', function () {
    const $challengeInstruction = $('.challenge-statement__instruction');
    const instructiontext = 'Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre';
    expect($challengeInstruction.text()).to.equal(instructiontext);
  });

  it('b4.2 It should display only one input text as proposal to user', function () {
    expect($('.challenge-response__proposal-input')).to.have.lengthOf(3);
  });

  it('b4.3 Error alert box should be displayed if user validate without checking a checkbox', async function () {
    // 1st make sure all inputs are cleared
    $(':input').val('');
    // Then try to validate sth
    await click($('.challenge-actions__action-validate'));

    expect($('.alert')).to.have.lengthOf(1);
    expect($('.alert').text().trim()).to.equal('Pour valider, saisir au moins une réponse. Sinon, passer.');
  });


});
