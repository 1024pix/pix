import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

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
      return visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
    });

    it('b5.1 Une image unique peut être affichée sous la consigne', function () {
      const $illustration = findWithAssert('.challenge-illustration > img');
      expect($illustration.length).to.equal(1);
    });

    it('b5.2 Cette image a un alt text “ceci est une image”', function () {
      const $illustration = findWithAssert('.challenge-illustration > img');
      expect($illustration.attr('alt')).to.contains('ceci est une image');
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
      const $illustration = $('.challenge-illustration');
      expect($illustration.length).to.equal(0);
    });
  });
});
