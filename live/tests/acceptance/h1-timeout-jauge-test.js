import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import {resetTestingState, bodyOfLastPostRequest, urlOfLastPostRequest} from '../helpers/shared-state';
import _ from 'pix-live/utils/lodash-custom';


function getValidateActionLink() {
  return $('.challenge-actions__action-validate');
}
function getSkipActionLink() {
  return $('.challenge-actions__action-skip');
}


function visitTimedChallenge() {
  visit(TIMED_CHALLENGE_URI);
  andThen(() => {
    const buttonConfirm = findWithAssert(CHALLENGE_ITEM_WARNING_BUTTON);
    buttonConfirm.click();
  });
}

const TIMED_CHALLENGE_URI = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const CHALLENGE_ITEM_WARNING_BUTTON = '.challenge-item-warning button';

describe('Acceptance | H1 - Timeout Jauge | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('Test affichage ou non de la jauge', function () {
    //XXX: Deux cas car on test aussi une absence d'affichage
    it('doit afficher la jauge si exigée par le backend mais ne pas l\'afficher dans le cas contraire ', function () {
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

  describe('Test quand la jauge est affichée', function () {

    beforeEach(function() {
      resetTestingState();
      visit('/');
    });

    afterEach(function() {
      resetTestingState();
    })
    ;
    describe('Sauvegarde du temps passé | ', function () {

      it('Si l\'utilisateur valide, demande la sauvegarde du temps restant en secondes', function () {
        visitTimedChallenge();
        andThen(() => {
          const $countDown = findWithAssert('.timeout-jauge-remaining');
          expect($countDown.text().trim()).to.equal('0:02');
        });
        andThen(() => {
          click(getValidateActionLink());
        });
        andThen(() => {
          expect(urlOfLastPostRequest()).to.equal('/api/answers');
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.timeout')).to.equal(2);
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.value')).to.equal('2,4');
        });
      });

      it('Si l\'utilisateur ABANDONNE, demande la sauvegarde du temps restant en secondes', function () {
        visitTimedChallenge();
        andThen(() => {
          click(getSkipActionLink());
        });
        andThen(() => {
          expect(urlOfLastPostRequest()).to.equal('/api/answers');
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.timeout')).to.equal(2);
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.value')).to.equal('#ABAND#');
        });
      });

    });

  });
});
