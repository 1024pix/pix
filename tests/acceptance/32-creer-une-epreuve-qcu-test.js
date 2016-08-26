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
    challenge = server.create('challenge-airtable');
  });

  after(function () {
    destroyApp(application);
  });

  describe('32 - Prévisualiser une épreuve |', function () {

    let challengeId;

    before(function () {
      challengeId  = challenge.attrs.id;
      return visit(`/challenges/${challengeId}/preview`);
    });

    it('32.1. Il est possible de prévisualiser une épreuve en accédant à l\'URL /challenges/:id/preview', function () {
      expect(currentURL()).to.equal(`/challenges/${challengeId}/preview`);
    });

    describe('On affiche', function () {

      let $challenge;

      before(function () {
        $challenge = findWithAssert('#challenge-preview');
      });

      it('32.2 la consigne de l\'épreuve', function () {
        expect($challenge.find('.challenge-instruction').text()).to.contains(challenge.attrs.fields.Consigne);
      });

      // FIXME: this is not part of the US. This should be removed (need validation in PR)
      //it('32.3 les propositions sous forme de boutons radio', function () {
      //  const $proposals = findWithAssert('.challenge-proposals input[type="radio"][name="proposals"]');
      //  expect($proposals).to.have.lengthOf(5);
      //});
    });
  });
});
