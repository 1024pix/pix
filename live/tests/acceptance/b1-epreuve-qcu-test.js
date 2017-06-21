import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | b1 - Afficher un QCU | ', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('b1.1 Une liste de radiobuttons doit s\'afficher', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    // then
    const $proposals = $('input[type=radio][name="radio"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('b1.2 Par défaut, le radiobutton de la réponse sauvegardée est affiché', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    // then
    expect($('input[type=radio][name="radio"]:checked')).to.have.lengthOf(1);
  });

  it('b1.3 Une liste ordonnée d\'instruction doit s\'afficher', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    // then
    expect($('.proposal-text:eq(0)').text().trim()).to.equal('1ere possibilite');
    expect($('.proposal-text:eq(1)').text().trim()).to.equal('2eme possibilite');
    expect($('.proposal-text:eq(2)').text().trim()).to.equal('3eme possibilite');
    expect($('.proposal-text:eq(3)').text().trim()).to.equal('4eme possibilite');
  });

  it('b1.4 L\'alerte est affichée si l\'utilisateur valide, mais aucun radiobutton n\'est coché', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    $(':radio').prop('checked', false);

    // when
    await click('.challenge-actions__action-validate');

    // then
    const $alert = $('.alert');
    expect($alert).to.have.lengthOf(1);
    expect($alert.text().trim()).to.equal('Pour valider, sélectionner une réponse. Sinon, passer.');
  });

  it('b1.5 Si un utilisateur clique sur un radiobutton, il est le seul coché, et les autres sont décochés', async function() {
    // Given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    expect($('input[type=radio][name="radio"]:eq(0)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(1)').is(':checked')).to.equal(true);
    expect($('input[type=radio][name="radio"]:eq(2)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(3)').is(':checked')).to.equal(false);

    // When
    await click($('.label-checkbox-proposal--qcu:eq(0)')); // Click on label trigger the event.

    // Then
    expect($('input[type=radio][name="radio"]:eq(0)').is(':checked')).to.equal(true);
    expect($('input[type=radio][name="radio"]:eq(1)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(2)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(3)').is(':checked')).to.equal(false);
  });

  it('b1.6 Si un utilisateur clique sur un radiobutton, et valide l\'épreuve, une demande de sauvegarde de sa réponse est envoyée à l\'API', async function() {
    // Given
    server.post('/answers', (schema, request) => {
      const params = JSON.parse(request.requestBody);

      expect(params.data.type).to.equal('answers');
      expect(params.data.attributes.value).to.equal('4');

      return {
        data: {
          type: 'answers',
          id: 'ref_answer_qcm_id',
          attributes: {
            value: '4'
          }
        }
      };
    });

    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    expect($('input[type=radio][name="radio"]:eq(0)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(1)').is(':checked')).to.equal(true);
    expect($('input[type=radio][name="radio"]:eq(2)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(3)').is(':checked')).to.equal(false);

    // When
    await click($('.label-checkbox-proposal--qcu:eq(3)'));
    await click('.challenge-actions__action-validate');

    // Then
  });
});
