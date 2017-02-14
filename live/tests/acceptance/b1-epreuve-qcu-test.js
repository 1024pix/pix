import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { resetPostRequest, bodyOfLastPostRequest, urlOfLastPostRequest } from '../helpers/shared-state';
import _ from 'pix-live/utils/lodash-custom';

function getProposalInputs() {
  return $('.challenge-response__proposal-input');
}

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
    const $proposals = $('.challenge-response__proposal-input[type="radio"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('b1.2 Par défaut, le radiobutton de la réponse sauvegardée est affiché', function () {
    expect($('.challenge-response__proposal-input:radio:checked')).to.have.lengthOf(1);
  });

  it('b1.3 Une liste ordonnée d\'instruction doit s\'afficher', function () {
    expect($('.challenge-response__proposal:nth-child(1)').text().trim()).to.equal('1ere possibilite');
    expect($('.challenge-response__proposal:nth-child(2)').text().trim()).to.equal('2eme possibilite');
    expect($('.challenge-response__proposal:nth-child(3)').text().trim()).to.equal('3eme possibilite');
    expect($('.challenge-response__proposal:nth-child(4)').text().trim()).to.equal('4eme possibilite');
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

  it('b1.5 Si un utilisateur clique sur un radiobutton, il est coché', async function () {
    const $proposalInputs = getProposalInputs();
    expect($proposalInputs.first().is(':checked')).to.equal(false);
    await click($proposalInputs.first());
    expect($proposalInputs.first().is(':checked')).to.equal(true);
    expect($('.challenge-response__proposal-input:checked')).to.have.lengthOf(1);
  });

  it('b1.6 Si un utilisateur clique sur un radiobutton, il est coché, et tous les autres sont décochés', async function () {
    const checkedProposalInputsSelector = '.challenge-response__proposal-input:checked';
    expect($(checkedProposalInputsSelector)).to.have.lengthOf(1);
    await click($('.challenge-response__proposal-input').get(2));
    expect($(checkedProposalInputsSelector)).to.have.lengthOf(1);
  });

  it('b1.7 Si un utilisateur clique sur un radiobutton, et valide l\'épreuve, une demande de sauvegarde de sa réponse est envoyée à l\'API', async function () {
    resetPostRequest();
    const $proposalInputs = getProposalInputs();
    await click($proposalInputs.eq(1));
    expect($('.challenge-response__proposal-input:checked')).to.have.lengthOf(1);
    await click('.challenge-actions__action-validate');
    expect(urlOfLastPostRequest()).to.equal('/api/answers');
    expect(_.get(bodyOfLastPostRequest(), 'data.attributes.value')).to.equal('2');
  });
});
