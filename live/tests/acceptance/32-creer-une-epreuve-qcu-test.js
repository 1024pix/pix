import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 32 - Créer une épreuve de type QCU | ', function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('32 - Prévisualiser une épreuve |', function () {

    let challengeId;

    before(function () {
      return visit(`/challenges/challenge_qcu_id/preview`);
    });

    it('32.1. Il est possible de prévisualiser une épreuve en accédant à l\'URL /challenges/:id/preview', function () {
      expect(currentURL()).to.equal(`/challenges/challenge_qcu_id/preview`);
      expect(findWithAssert('#challenge-preview'));
    });

    describe('On affiche', function () {

      let $challenge;

      before(function () {
        $challenge = findWithAssert('#challenge-preview');
      });

      it('32.2 la consigne de l\'épreuve', function () {
        expect($challenge.find('.challenge-instruction').text()).to.contain('Julie a déposé un document dans un espace de stockage partagé avec Pierre. Elle lui envoie un mail pour l’en informer. Quel est le meilleur message ?');
      });

    });
  });
});
