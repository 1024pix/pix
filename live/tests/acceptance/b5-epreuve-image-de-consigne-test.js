import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  click('.challenge-item-warning button');
}

describe('Acceptance | b5 - Afficher une image sous la consigne | ', function () {

  let application;

  beforeEach(function () {
    application = startApp();
  });

  afterEach(function () {
    destroyApp(application);
  });

  describe('Quand l\'épreuve contient une illustration en consigne', function () {

    beforeEach(function () {
      visitTimedChallenge();
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

    beforeEach(function () {
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
