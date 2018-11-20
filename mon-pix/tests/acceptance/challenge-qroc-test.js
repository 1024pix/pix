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

describe('Acceptance | Displaying a QROC', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visit('/assessments/ref_assessment_id/challenges/ref_qroc_challenge_id');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should render the challenge instruction', function() {
    const $challengeInstruction = $('.challenge-statement__instruction');
    const instructiontext = 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre';
    expect($challengeInstruction.text().trim()).to.equal(instructiontext);
  });

  it('should display only one input text as proposal to user', function() {
    expect($('.challenge-response__proposal-input')).to.have.lengthOf(1);
  });

  it('should display the error alert if the users tries to validate an empty answer', function() {
    fillIn('input[data-uid="qroc-proposal-uid"]', '');
    expect($('.alert')).to.have.lengthOf(0);
    click(findWithAssert('.challenge-actions__action-validate'));
    andThen(() => {
      // assertions for after async behavior
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, saisir une réponse. Sinon, passer.');
    });
  });
});
