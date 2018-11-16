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

describe('Acceptance | Displaying a QCU', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should display a radio buttons list', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    // then
    const $proposals = $('input[type=radio][name="radio"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('should display the previously saved selected radio button by default', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    // then
    expect($('input[type=radio][name="radio"]:checked')).to.have.lengthOf(1);
  });

  it('should display an ordered list of instructions', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    // then
    expect($('.proposal-text:eq(0)').text().trim()).to.equal('1ere possibilite');
    expect($('.proposal-text:eq(1)').text().trim()).to.equal('2eme possibilite');
    expect($('.proposal-text:eq(2)').text().trim()).to.equal('3eme possibilite');
    expect($('.proposal-text:eq(3)').text().trim()).to.equal('4eme possibilite');
  });

  it('should display the error alter box if users validates with no radio button selected', async function() {
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

  it('should not be possible to select multiple radio buttons', async function() {
    // Given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');

    expect($('input[type=radio][name="radio"]:eq(0)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(1)').is(':checked')).to.equal(true);
    expect($('input[type=radio][name="radio"]:eq(2)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(3)').is(':checked')).to.equal(false);

    // When
    await click($('.label-checkbox-proposal:eq(0)')); // Click on label trigger the event.

    // Then
    expect($('input[type=radio][name="radio"]:eq(0)').is(':checked')).to.equal(true);
    expect($('input[type=radio][name="radio"]:eq(1)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(2)').is(':checked')).to.equal(false);
    expect($('input[type=radio][name="radio"]:eq(3)').is(':checked')).to.equal(false);
  });

  it('should send an api request to save the users answer when clicking the validate button', async function() {
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
    await click($('.label-checkbox-proposal:eq(3)'));
    await click('.challenge-actions__action-validate');

    // Then
  });

  it('should only display an error alert if the user tries to validate after having interacting once with the page', async function() {
    // given
    await visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
    $(':radio').prop('checked', false);
    await click('.challenge-actions__action-validate');

    // when
    await click($('.label-checkbox-proposal:eq(0)'));

    // then
    const $alert = $('.alert');
    expect($alert).to.have.lengthOf(0);
  });

});
