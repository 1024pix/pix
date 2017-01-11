import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import _ from 'pix-live/utils/lodash-custom';

function getValidateActionLink() {
  return $('.challenge-actions__action-validate');
}
function getSkipActionLink() {
  return $('.challenge-actions__action-skip');
}

function fullUrlOfLastPostRequest() {
  return $($('.last-post-request-url')[0]).text();
}
function urlOfLastPostRequest() {
  let postedOn = fullUrlOfLastPostRequest().split('/api/').pop();
  postedOn = '/api/' + postedOn;
  return postedOn;
}

function bodyOfLastPostRequest() {
  return JSON.parse($($('.last-post-request-body')[0]).text());
}

describe('Acceptance | H1 - Timeout Jauge | ',function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('Test affichage ou non de la jauge',function(){
    //XXX: Deux cas car on test aussi une absence d'affichage
    it('doit afficher la jauge si exigée par le backend mais ne pas l\'afficher dans le cas contraire ',function () {
      visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
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
    describe('Format d\'affichage',function () {

      it('valeur 2 en backend est affichée 0:02 dans le timer',function () {
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
        andThen(() => {
          const $countDown = findWithAssert('.timeout-jauge-remaining');
          expect($countDown.text().trim()).to.equal('0:02');
        });
      });

      it('valeur 70 en backend est affichée 1:10 dans le timer',function () {
        visit('/assessments/ref_assessment_id/challenges/ref_qru_challenge_id');
        andThen(() => {
          const $countDown = findWithAssert('.timeout-jauge-remaining');
          expect($countDown.text().trim()).to.equal('1:10');
        });
      });

      it('Le timer se décharge progressivement',function () {
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
        });
        // cas 1 : pas encore chargé
        andThen(() => {
          const $jaugeProgress = findWithAssert('.timeout-jauge-progress');
          expect($jaugeProgress.width()).to.equal(0);
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 2 : moitié chargé (50 signifie ici 50% de la largeur du compteur)
        andThen(() => {
          const $jaugeProgress = findWithAssert('.timeout-jauge-progress');
          expect($jaugeProgress.width()).to.equal(50);
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 3 : complètement chargé (100 signifie ici 100% de la largeur du compteur)
        andThen(() => {
          const $jaugeProgress = findWithAssert('.timeout-jauge-progress');
          expect($jaugeProgress.width()).to.equal(100);
        });
      });

      it('Décremente le compteur toutes les secondes, et s\'arrête définitivement à 0:00',function () {
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
        });
        // cas 1 : pas encore chargé
        andThen(() => {
          const $jaugeRemaining = findWithAssert('.timeout-jauge-remaining');
          expect($jaugeRemaining.text().trim()).to.equal('0:02');
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 2 : moitié chargé
        andThen(() => {
          const $jaugeRemaining = findWithAssert('.timeout-jauge-remaining');
          expect($jaugeRemaining.text().trim()).to.equal('0:01');
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 3 : complètement chargé
        andThen(() => {
          const $jaugeRemaining = findWithAssert('.timeout-jauge-remaining');
          expect($jaugeRemaining.text().trim()).to.equal('0:00');
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 4 : trop chargé (temps imparti dépassé)
        andThen(() => {
          const $jaugeRemaining = findWithAssert('.timeout-jauge-remaining');
          expect($jaugeRemaining.text().trim()).to.equal('0:00');
        });
      });

      it('Affiche le pictogramme en noir, ou en rouge lorsque le timer est à 0:00',function () {
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
        });
        // cas 1 : pas encore chargé : picto noir
        andThen(() => {
          const $jaugeClock = findWithAssert('.timeout-jauge-clock svg path');
          expect($jaugeClock.attr('fill')).to.equal('black');
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 2 : moitié chargé : picto noir
        andThen(() => {
          const $jaugeClock = findWithAssert('.timeout-jauge-clock svg path');
          expect($jaugeClock.attr('fill')).to.equal('black');
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 3 : complètement chargé : picto rouge
        andThen(() => {
          const $jaugeClock = findWithAssert('.timeout-jauge-clock svg path');
          expect($jaugeClock.attr('fill')).to.equal('red');
        });
        triggerEvent('.timeout-jauge', 'simulateOneMoreSecond');
        // cas 4 : trop chargé (temps imparti dépassé) : picto rouge
        andThen(() => {
          const $jaugeClock = findWithAssert('.timeout-jauge-clock svg path');
          expect($jaugeClock.attr('fill')).to.equal('red');
        });
      });

    });

    describe('Sauvegarde du temps passé | ',function () {

      it('Si l\'utilisateur valide et il reste du temps, demande la sauvegarde du temps restant en secondes', function () {
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
        andThen(() => {
          triggerEvent('.timeout-jauge', 'resetElapsedTime');
          $('.last-post-request').remove();
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
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
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
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
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
        visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
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
