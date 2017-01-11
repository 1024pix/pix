import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | g1 - Bandeau no internet no outils |', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('Afficher un bandeau si l\'utilisateur ne doit pas utiliser ni Internet ni outils tierce', function () {

    before(function () {
      visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
    });

    it('g1.1 Le bandeau s\'affiche si l\'épreuve le requiert', function () {
      expect(findWithAssert('.challenge-stay__text').text()).to.contains('Vous devez répondre à cette question sans sortir de cette page !');
    });

  });

  describe('Ne doit pas afficher un bandeau si l\'utilisateur a le droit d\'utiliser Internet et des outils tierce', function () {

    before(function () {
      visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
    });

    it('g1.2 Le bandeau s\'affiche si l\'épreuve le requiert', function () {
      expect($('.challenge-stay__text')).to.have.lengthOf(0);
    });

  });

});
