import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import {resetTestingState, bodyOfLastPostRequest, urlOfLastPostRequest} from '../helpers/shared-state';
import _ from 'pix-live/utils/lodash-custom';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  click('.challenge-item-warning button');
}

describe('Acceptance | b2 - Afficher un QCM | ', function () {

  let application;

  before(function () {
    application = startApp();
    visitTimedChallenge();
  });

  after(function () {
    destroyApp(application);
  });

  it('b2.1 It should render challenge instruction', function () {
    const $challengeInstruction = $('.challenge-statement__instruction');
    const instructionText = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs';
    expect($challengeInstruction.text()).to.equal(instructionText);
  });

  it('b2.2 Le contenu de type [foo](bar) doit être converti sous forme de lien', function () {
    const $links = findWithAssert('.challenge-statement__instruction a');
    expect($links.length).to.equal(1);
    expect($links.text()).to.equal('plusieurs');
    expect($links.attr('href')).to.equal('http://link.plusieurs.url');
  });

  it('b2.3 Les liens doivent s\'ouvrir dans un nouvel onglet', function () {
    const $links = findWithAssert('.challenge-statement__instruction a');
    expect($links.attr('target')).to.equal('_blank');
  });

  it('b2.4 It should render a list of checkboxes', function () {
    const $proposals = $('input[type="checkbox"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('b2.5 By default, already checked checkboxes are checked', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(2);
  });

  it('b2.6 It should render an ordered list of instruction', function () {
    expect($('.proposal-text:eq(0)').text().trim()).to.equal('possibilite 1, et/ou');
    expect($('.proposal-text:eq(1)').text().trim()).to.equal('possibilite 2, et/ou');
    expect($('.proposal-text:eq(2)').text().trim()).to.equal('possibilite 3, et/ou');
    expect($('.proposal-text:eq(3)').text().trim()).to.equal('possibilite 4');
  });

  it('b2.7 Error alert box should be hidden by default', function () {
    expect($('.alert')).to.have.lengthOf(0);
  });

  it('b2.8 Error alert box should be displayed if user validate without checking a checkbox', function () {
    const $validateLink = $('.challenge-actions__action-validate');
    expect($('input:checkbox:checked')).to.have.lengthOf(2);
    $('input:checkbox').prop('checked', false);
    expect($('input:checkbox:checked')).to.have.lengthOf(0);
    click($validateLink);
    andThen(() => {
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, sélectionner au moins une réponse. Sinon, passer.');
    });
  });

  it('b2.9 If an user check a checkbox, it is checked', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(0);
    $('.input-checkbox-proposal:eq(1)').click();
    andThen(() => {
      expect($('input:checkbox:checked')).to.have.lengthOf(1);
    });
  });

  it('b2.10 If an user check another checkbox, it is checked, the previous checked checkboxes remains checked', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(1);
    $('.input-checkbox-proposal:eq(2)').click();
    andThen(() => {
      expect($('input:checkbox:checked')).to.have.lengthOf(2);
    });
  });

  it('b2.11 If an user validate the challenge, the api is request to save the answer of the user', async function () {
    resetTestingState();
    await click('.challenge-actions__action-validate');
    expect(urlOfLastPostRequest()).to.equal('/api/answers');
    expect(_.get(bodyOfLastPostRequest(), 'data.attributes.value')).to.equal('2,3');
  });
});
