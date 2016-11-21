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

describe("Acceptance | 14 - Afficher un QROC | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/assessments/first_assessment_id/challenges/ref_qrocm_challenge_id`);
  });

  it('14.1 It should render challenge instruction', function () {
    // instruction is :
    // Un QCM propose plusieurs choix, lutilisateur peut en choisir plusieurs
    expect($('.challenge-instruction').text()).to.equal('Un QROCM est une question ouverte avec plusieurs champs texte libre pour repondre');
  });

  it('14.2 It should display only one input text as proposal to user', function () {
    expect($('.challenge-proposals input[type="text"]')).to.have.lengthOf(3);
  });

  it('14.3 Error alert box should be displayed if user validate without checking a checkbox', function () {
    $('a.challenge-item-actions__validate-action').click();
    andThen(() => {
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, saisir au moins une réponse. Sinon, passer.');
    });
  });


});
