import {
  describe,
  it,
  before,
  beforeEach,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 13 - Afficher un QROC | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/assessments/first_assessment_id/challenges/ref_qroc_challenge_full`);
  });

  it('13.1 It should render challenge instruction', function () {
    // instruction is :
    // Un QCM propose plusieurs choix, lutilisateur peut en choisir plusieurs
    expect($('.challenge-instruction').text()).to.equal('Un QROC est une question ouverte avec un simple champ texte libre pour répondre');
  });

  it('13.2 It should display only one input text as proposal to user', function () {
    expect($('.challenge-proposals input[type="text"]')).to.have.lengthOf(1);
  });

  it('13.3 Error alert box should be displayed if user validate without checking a checkbox', function () {
    $('a.challenge-item-actions__validate-action').click();
    andThen(() => {
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, saisir une réponse. Sinon, passer.');
    });
  });


});
