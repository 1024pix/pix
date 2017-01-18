import {expect} from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
}

function visitUntimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
}
describe('Acceptance | I1 - Warning prochaine page timée  | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('i1- Test affichage ou non de la page avec le warning', function () {
    //XXX: Deux cas car on test aussi une absence d'affichage
    it('i1.1- doit cacher le contenu du challenge si l\'épreuve est timée mais l\'afficher dans le cas contraire ', function () {
      visitTimedChallenge();
      andThen(() => {
        expect($('.challenge-statement')).to.have.lengthOf(0);
      });
      visitUntimedChallenge();
      andThen(() => {
        expect($('.challenge-statement')).to.have.lengthOf(1);
      });
    });

    it('i1.2- doit afficher le warning si l\'épreuve est timée mais ne pas l\'afficher dans le cas contraire ', function () {
      visitTimedChallenge();
      andThen(() => {
        expect($('.challenge-item-warning')).to.have.lengthOf(1);
      });
      visitUntimedChallenge();
      andThen(() => {
        expect($('.challenge-item-warning')).to.have.lengthOf(0);
      });
    });

    it('i1.3- vérifier que le timer n\'est pas démarré automatiquement lorsque l\'épreuve est timée', function () {
      visitTimedChallenge();
      andThen(() => {
        expect($('.timeout-jauge')).to.have.lengthOf(0);
      });
    });

  });

  describe('i2-Test comportement lorsque le bouton de confirmation est cliqué', function () {
    before(function () {
      visitTimedChallenge();
      andThen(function () {
        const buttonConfirm = findWithAssert('.challenge-item-warning button');
        buttonConfirm.click();
      });
    });

    it('i2.1- vérifier que le warning est caché ', function () {
      expect($('.challenge-item-warning')).to.have.lengthOf(0);
    });

    it('i2.2- vérifier que le contenu de l\'épreuve est affiché', function () {
      expect($('.challenge-statement').css('display')).to.contains('block');
    });

    it('i2.3- vérifier que le timer est démarré ', function () {
      expect($('.timeout-jauge')).to.have.lengthOf(1);
    });

  });
});
