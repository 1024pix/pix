import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 37 - Prévisualiser un test |', function () {

  const courseId = 'rec5duNNrPqbSzQ8o';
  const firstChallengeId = 'recLt9uwa2dR3IYpi';
  const secondChallengeId = 'recub31NerwonPVwX';

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('Prévisualiser la première page d\'un test |', function () {

    before(function () {
      return visit(`/courses/${courseId}/preview`);
    });

    it('L\'accès à la preview d\'un test se fait en accédant à l\'URL /courses/:course_id/preview', function () {
      expect(currentURL()).to.equal(`/courses/${courseId}/preview`);
    });

    let $preview;

    describe('On affiche', function () {

      before(function () {
        $preview = findWithAssert('#course-preview');
      });

      it('le titre de la page avec l\'identifiant du test', function () {
        expect($preview.find('.title').text()).to.contains(`Prévisualisation du test #${courseId}`);
      });

      it('le nom du test', function () {
        expect($preview.find('.course-name').text()).to.contains('course_name');
      });

      it('la description du test', function () {
        expect($preview.find('.course-description').text()).to.contains('course_description');
      });

      it('un bouton pour démarrer la simulation du test et qui mène à la première question', function () {
        const $playButton = findWithAssert('.simulate-button');
        expect($playButton.text()).to.be.equals('Simuler le test');
        expect($playButton.attr('href')).to.be.equals(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
      });
    });
  });

  describe('Prévisualiser une épreuve dans le cadre d\'un test |' , function () {

    before(function () {
      return visit(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
    });

    it('L\'accès à la preview d\'une épreuve d\'un testse fait en accédant à l\'URL /courses/:course_id/preview/challenges/:challenge_id', function () {
      expect(currentURL()).to.equal(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
    });

    describe('On affiche', function () {

      let $challenge;

      before(function () {
         $challenge = findWithAssert('.challenge-preview');
      });

      it('l\'identifiant de l\'épreuve', function () {
        expect($challenge.find('.title').text()).to.contains(`Prévisualisation de l'épreuve #${firstChallengeId}`);
      });

      it('la consigne de l\'épreuve', function () {
        expect($challenge.find('.challenge-instruction').text()).to.contains('Que peut-on dire des œufs de catégorie A ?');
      });

      it('les propositions sous forme de boutons radio pour un QCU', function () {
        const $proposals = findWithAssert('.challenge-proposals input[type="radio"][name="proposals"]');
        expect($proposals).to.have.lengthOf(5);
      });

      it('un bouton pour accéder à l\'épreuve suivante', function() {
        const $nextChallengeButton = findWithAssert('.next-challenge-button');
        expect($nextChallengeButton.text()).to.be.equals('Épreuve suivante');
        expect($nextChallengeButton.attr('href')).to.be.equals(`/courses/${courseId}/preview/challenges/${secondChallengeId}`);
      });
    });
  });

});
