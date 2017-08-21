import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

function visitTimedChallenge() {
  visit(TIMED_CHALLENGE_URI);
  andThen(() => {
    const buttonConfirm = findWithAssert(CHALLENGE_ITEM_WARNING_BUTTON);
    buttonConfirm.click();
  });
}

const TIMED_CHALLENGE_URI = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const CHALLENGE_ITEM_WARNING_BUTTON = '.challenge-item-warning button';

describe('Acceptance | H1 - Timeout Jauge | ', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Test affichage ou non de la jauge', function() {
    //XXX: Deux cas car on test aussi une absence d'affichage
    it('doit afficher la jauge si exigée par le backend mais ne pas l\'afficher dans le cas contraire ', function() {
      visitTimedChallenge();
      andThen(() => {
        expect($('.timeout-jauge')).to.have.lengthOf(1);
      });
      visit('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
      andThen(() => {
        expect($('.timeout-jauge')).to.have.lengthOf(0);
      });
    });
  });
});
