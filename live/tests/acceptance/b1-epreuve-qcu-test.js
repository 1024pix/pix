import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { resetTestingState, bodyOfLastPostRequest, urlOfLastPostRequest } from '../helpers/shared-state';
import _ from 'pix-live/utils/lodash-custom';


let application;

describe('Acceptance | b1 - Afficher un QCU | ', function () {

  beforeEach(function () {
    application = startApp();
    visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('b1.1 Une liste de radiobuttons doit s\'afficher', function () {
    const $proposals = $('.input-radio-proposal');
    expect($proposals).to.have.lengthOf(4);
  });

  it('b1.2 Par défaut, le radiobutton de la réponse sauvegardée est affiché', function () {
    expect($('.input-radio-proposal:checked')).to.have.lengthOf(1);
  });

  it('b1.3 Une liste ordonnée d\'instruction doit s\'afficher', function () {
    expect($('.proposal-text:eq(0)').text().trim()).to.equal('1ere possibilite');
    expect($('.proposal-text:eq(1)').text().trim()).to.equal('2eme possibilite');
    expect($('.proposal-text:eq(2)').text().trim()).to.equal('3eme possibilite');
    expect($('.proposal-text:eq(3)').text().trim()).to.equal('4eme possibilite');
  });

  it('b1.4 L\'alerte est affichée si l\'utilisateur valide, mais aucun radiobutton n\'est coché', async function () {

    // given
    $(':radio').prop('checked', false);

    // when
    await click('.challenge-actions__action-validate');

    // then
    const $alert = $('.alert');
    expect($alert).to.have.lengthOf(1);
    expect($alert.text().trim()).to.equal('Pour valider, sélectionner une réponse. Sinon, passer.');
  });

  it('b1.5 Si un utilisateur clique sur un radiobutton, il est le seul coché, et les autres sont décochés', async function () {

    // Given
    expect($('.input-radio-proposal:eq(0)').is(':checked')).to.equal(false);
    expect($('.input-radio-proposal:eq(1)').is(':checked')).to.equal(true);
    expect($('.input-radio-proposal:eq(2)').is(':checked')).to.equal(false);
    expect($('.input-radio-proposal:eq(3)').is(':checked')).to.equal(false);

    // When
    await click($('.label-checkbox-proposal--qcu:eq(0)')); // Click on label trigger the event.

    // Then
    expect($('.input-radio-proposal:eq(0)').is(':checked')).to.equal(true);
    expect($('.input-radio-proposal:eq(1)').is(':checked')).to.equal(false);
    expect($('.input-radio-proposal:eq(2)').is(':checked')).to.equal(false);
    expect($('.input-radio-proposal:eq(3)').is(':checked')).to.equal(false);
  });

  it('b1.6 Si un utilisateur clique sur un radiobutton, et valide l\'épreuve, une demande de sauvegarde de sa réponse est envoyée à l\'API', async function () {
    // Given
    resetTestingState();

    // Given
    expect($('.input-radio-proposal:eq(0)').is(':checked')).to.equal(false);
    expect($('.input-radio-proposal:eq(1)').is(':checked')).to.equal(true);
    expect($('.input-radio-proposal:eq(2)').is(':checked')).to.equal(false);
    expect($('.input-radio-proposal:eq(3)').is(':checked')).to.equal(false);

    // When
    await click($('.label-checkbox-proposal--qcu:eq(3)'));
    await click('.challenge-actions__action-validate');

    // Then
    expect(urlOfLastPostRequest()).to.equal('/api/answers');
    expect(_.get(bodyOfLastPostRequest(), 'data.attributes.value')).to.equal('4');
  });
});
