import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  andThen(() => {
    const buttonConfirm = findWithAssert('.challenge-item-warning button');
    buttonConfirm.click();
  });
}

describe('Acceptance | b5 - Afficher une image sous la consigne | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('Quand l\'épreuve contient une illustration en consigne', function () {

    before(function () {
      return visitTimedChallenge();
    });

    it('b5.1 Une image unique peut être affichée sous la consigne', function () {
      const $illustration = findWithAssert('.challenge-statement__illustration');
      expect($illustration.length).to.equal(1);
    });

    it('b5.2 Cette image a un alt text “ceci est une image”', function () {
      const $illustration = findWithAssert('.challenge-statement__illustration');
      expect($illustration.attr('alt')).to.contains('Illustration de l\'épreuve');
    });
  });

  describe('Quand l\'épreuve ne contient pas d\'illustration en consigne', function () {

    before(function () {
      return visit('/assessments/raw_assessment_id/challenges/raw_qcm_challenge_id');
    });

    it('b5.3 La section d\'illustration est cachée', function () {

      // We are in a challenge...
      findWithAssert('.challenge-item');

      // ... but illustration is hidden
      const $illustration = $('.challenge-statement__illustration');
      expect($illustration.length).to.equal(0);
    });
  });
});
