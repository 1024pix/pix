import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

describe('Acceptance | f1 - Prévisualisation  d\'un test |', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Prévisualiser la première page d\'un test |', function() {

    beforeEach(function() {
      visit('/courses/ref_course_id/preview');
    });

    it('f1.1 L\'accès à la preview d\'un test se fait en accédant à l\'URL /courses/:course_id/preview', function() {
      expect(currentURL()).to.equal('/courses/ref_course_id/preview');
    });

    let $preview;

    describe('On affiche', function() {

      beforeEach(function() {
        $preview = findWithAssert('#course-preview');
      });

      it('f1.2 le nom du test', function() {
        expect($preview.find('.course-name').text()).to.contain('First Course');
      });

      it('f1.3 la description du test', function() {
        const $courseDescription = $preview.find('.course-description');
        const instructionText = 'Contient toutes sortes d\'epreuves avec différentes caractéristiques couvrant tous les cas d\'usage.';
        expect($courseDescription.text()).to.contain(instructionText);
      });

      it('f1.4 un bouton pour démarrer la simulation du test et qui mène à la première question', function() {
        const $playButton = findWithAssert('.simulate-button');
        expect($playButton.text()).to.be.equals('Simuler le test');
        expect($playButton.attr('href')).to.be.equals('/courses/ref_course_id/preview/challenges/ref_qcm_challenge_id');
      });
    });
  });

  describe('Prévisualiser une épreuve dans le cadre d\'un test |', function() {

    beforeEach(async function() {
      await visit('/courses/ref_course_id/preview/challenges/ref_qcm_challenge_id');
      await click('.challenge-item-warning button');
    });

    it('f1.5 L\'accès à la preview d\'une épreuve d\'un test se fait en accédant à l\'URL /courses/:course_id/preview/challenges/:challenge_id', function() {
      expect(currentURL()).to.equal('/courses/ref_course_id/preview/challenges/ref_qcm_challenge_id');
    });

    describe('On affiche', function() {

      it('f1.6 la consigne de l\'épreuve', function() {
        expect(findWithAssert('.challenge-preview .challenge-statement__instruction').html()).to.contain('Un QCM propose plusieurs choix');
      });

      it('f1.7 un bouton pour accéder à l\'épreuve suivante', function() {
        expect(findWithAssert('.challenge-preview .challenge-actions__action-validate').text()).to.contain('Je valide');
      });
    });
  });

});
