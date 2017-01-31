import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | e1 - Prévisualiser une épreuve | ', function () {

  let application;

  beforeEach(function () {
    application = startApp();
  });

  afterEach(function () {
    destroyApp(application);
  });

  describe('e1 - Prévisualiser une épreuve |', function () {

    beforeEach(function () {
      visit('/challenges/ref_qcu_challenge_id/preview');
    });

    it('e1.1 Il est possible de prévisualiser une épreuve en accédant à l\'URL /challenges/:id/preview', function () {
      expect(currentURL()).to.equal('/challenges/ref_qcu_challenge_id/preview');
      expect(findWithAssert('#challenge-preview'));
    });

    describe('On affiche', function () {

      let $challenge;

      beforeEach(function () {
        $challenge = findWithAssert('#challenge-preview');
      });

      it('e1.2 la consigne de l\'épreuve', function () {
        expect($challenge.find('.challenge-statement__instruction').text()).to.contain('Un QCU propose plusieurs choix, l\'utilisateur peut en choisir un seul');
      });

    });
  });
});
