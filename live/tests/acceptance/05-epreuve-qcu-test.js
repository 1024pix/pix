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

describe("Acceptance | 15 - Afficher un QCU | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/assessments/first_assessment_id/challenges/ref_qcu_challenge_id`);
  });


  it('05.1 Une liste de radiobuttons doit s\'afficher', function () {
    const $proposals = $('input[type="radio"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('05.2 Une liste ordonnée d\'instruction doit s\'afficher', function () {
    const $proposals = $('input[type="radio"]');
    expect($('.challenge-proposal:nth-child(1)').text().trim()).to.equal('1ere possibilite');
    expect($('.challenge-proposal:nth-child(2)').text().trim()).to.equal('2eme possibilite');
    expect($('.challenge-proposal:nth-child(3)').text().trim()).to.equal('3eme possibilite');
    expect($('.challenge-proposal:nth-child(4)').text().trim()).to.equal('4eme possibilite');
  });

  it('05.4 L\'alerte est affichée si l\'utilisateur valide, mais aucun radiobutton n\'est coché', function () {
    $('a.challenge-item-actions__validate-action').click();
    andThen(() => {
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, sélectionner une réponse. Sinon, passer.');
    });
  });

  it('05.5 Par défaut, aucun radiobutton n\'est coché', function () {
    expect($('input:radio:checked')).to.have.lengthOf(0);
  });

  it('05.6 Si un utilisateur clique sur un radiobutton, il est coché', function () {
    expect($('input:radio:checked:nth-child(1)').is(':checked')).to.equal(false);
    click($('.challenge-proposal:nth-child(1) input'));
    andThen(() => {
      expect($('input:radio:checked:nth-child(1)').is(':checked')).to.equal(true);
      expect($('input:radio:checked')).to.have.lengthOf(1);
    });
  });

  it('05.7 Si un utilisateur clique sur un radiobutton, il est coché, et tous les autres sont décochés', function () {
    expect($('input:radio:checked')).to.have.lengthOf(1);
    click($('.challenge-proposal:nth-child(2) input'));
    andThen(() => {
      expect($('input:radio:checked')).to.have.lengthOf(1);
    });
  });



});
