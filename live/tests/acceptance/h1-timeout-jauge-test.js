import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import {resetTestingState, bodyOfLastPostRequest, urlOfLastPostRequest, setTestingState} from '../helpers/shared-state';
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
    describe('Format d\'affichage', function () {

      beforeEach(function() {
        resetTestingState();
        visit('/');
      });

      afterEach(function() {
        resetTestingState();
      });

      it('valeur 70 en backend est affichée 1:10 dans le timer', function () {
        setTestingState({stubTimer:70});
        visitTimedChallenge();

        andThen(() => {
          const $countDown = findWithAssert('.timeout-jauge-remaining');
          expect($countDown.text().trim()).to.equal('1:10');
        });
      });

      it('valeur 2 en backend est affichée 0:02 dans le timer', function () {
        visitTimedChallenge();
        andThen(() => {
          const $countDown = findWithAssert('.timeout-jauge-remaining');
          expect($countDown.text().trim()).to.equal('0:02');
        });
      });

    });

    describe('Sauvegarde du temps passé | ', function () {

      it('Si l\'utilisateur valide et il reste du temps, demande la sauvegarde du temps restant en secondes', function () {
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
          $('.last-post-request').remove();
          const $countDown = findWithAssert('.timeout-jauge-remaining');
          expect($countDown.text().trim()).to.equal('0:02');
        });
        andThen(() => {
          click(getValidateActionLink());
        });
        andThen(() => {
          expect(urlOfLastPostRequest()).to.equal('/api/answers');
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.timeout')).to.equal(2);
        });
      });

      it('Si l\'utilisateur valide et si le temps imparti est dépassé, demande la sauvegarde du nombre de secondes après 0', function () {
        visitTimedChallenge();
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
          $('.last-post-request').remove();
        });
        andThen(() => {
          triggerEvent('.timeout-jauge', 'simulateOneMoreSecond'); // 1 second left
          triggerEvent('.timeout-jauge', 'simulateOneMoreSecond'); // 0 second left
          triggerEvent('.timeout-jauge', 'simulateOneMoreSecond'); // -1 second below 0
          click(getValidateActionLink());
        });
        andThen(() => {
          expect(urlOfLastPostRequest()).to.equal('/api/answers');
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.timeout')).to.equal(-1);
        });
      });

      it('Si l\'utilisateur ABANDONNE et il reste du temps, demande la sauvegarde du temps restant en secondes', function () {
        resetTestingState();
        visitTimedChallenge();
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
          $('.last-post-request').remove();
        });
        andThen(() => {
          click(getSkipActionLink());
        });
        andThen(() => {
          expect(urlOfLastPostRequest()).to.equal('/api/answers');
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.timeout')).to.equal(2);
        });
      });

      it('Si l\'utilisateur ABANDONNE et si le temps imparti est dépassé, demande la sauvegarde du nombre de secondes après 0', function () {
        resetTestingState();
        visitTimedChallenge();
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
          $('.last-post-request').remove();
        });
        andThen(() => {
          triggerEvent('.timeout-jauge', 'simulateOneMoreSecond'); // 1 second left
          triggerEvent('.timeout-jauge', 'simulateOneMoreSecond'); // 0 second left
          triggerEvent('.timeout-jauge', 'simulateOneMoreSecond'); // -1 second below 0
          click(getSkipActionLink());
        });
        andThen(() => {
          expect(urlOfLastPostRequest()).to.equal('/api/answers');
          expect(_.get(bodyOfLastPostRequest(), 'data.attributes.timeout')).to.equal(-1);
        });
      });

    });

  });
});
