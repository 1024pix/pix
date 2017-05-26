import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import {resetTestingState, bodyOfLastPostRequest, urlOfLastPostRequest} from '../helpers/shared-state';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import _ from 'pix-live/utils/lodash-custom';

describe('Acceptance | b3 - Afficher un QROC | ', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visit('/assessments/ref_assessment_id/challenges/ref_qroc_challenge_id');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('b3.1 It should render challenge instruction', function() {
    const $challengeInstruction = $('.challenge-statement__instruction');
    const instructiontext = 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre';
    expect($challengeInstruction.text().trim()).to.equal(instructiontext);
  });

  it('b3.2 It should display only one input text as proposal to user', function() {
    expect($('.challenge-response__proposal-input')).to.have.lengthOf(1);
  });

  it('b3.3 Error alert box should be displayed if user validate without writing any answer', function() {
    fillIn('input[data-uid="qroc-proposal-uid"]', '');
    expect($('.alert')).to.have.lengthOf(0);
    click(findWithAssert('.challenge-actions__action-validate'));
    andThen(() => {
      // assertions for after async behavior
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, saisir une réponse. Sinon, passer.');
    });
  });

  it('b3.4 It should save the answer of the user when user validate', async function() {
    resetTestingState();
    fillIn('input[data-uid="qroc-proposal-uid"]', 'My New Answer');
    await click('.challenge-actions__action-validate');
    expect(urlOfLastPostRequest()).to.equal('/api/answers');
    expect(_.get(bodyOfLastPostRequest(), 'data.attributes.value')).to.equal('My New Answer');
  });

});
