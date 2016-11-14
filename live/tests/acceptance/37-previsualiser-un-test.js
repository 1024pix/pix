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

  let challenges;
  let course;
  let lastChallengeId;

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe("Prévisualiser la première page d'un test |", function () {

    before(function () {
      visit(`/courses/simple_course_id/preview`);
    });

    it("37.1. L'accès à la preview d'un test se fait en accédant à l'URL /courses/:course_id/preview", function () {
      expect(currentURL()).to.equal(`/courses/simple_course_id/preview`);
    });

    let $preview;

    describe('On affiche', function () {

      before(function () {
        $preview = findWithAssert('#course-preview');
      });

      it('37.2. le nom du test', function () {
        expect($preview.find('.course-name').text()).to.contains("Name of the course");
      });

      it('37.3. la description du test', function () {
        expect($preview.find('.course-description').text()).to.contains("A short description of the course");
      });

      it('37.4. un bouton pour démarrer la simulation du test et qui mène à la première question', function () {
        const $playButton = findWithAssert('.simulate-button');
        expect($playButton.text()).to.be.equals('Simuler le test');
        expect($playButton.attr('href')).to.be.equals(`/courses/simple_course_id/preview/challenges/qcm_challenge_id`);
      });
    });
  });

  describe("Prévisualiser une épreuve dans le cadre d'un test |", function () {

    before(function () {
      visit(`/courses/simple_course_id/preview/challenges/qcm_challenge_id`);
    });

    it("37.5. L'accès à la preview d'une épreuve d'un testse fait en accédant à l'URL /courses/:course_id/preview/challenges/:challenge_id", function () {
      expect(currentURL()).to.equal(`/courses/simple_course_id/preview/challenges/qcm_challenge_id`);
    });

    describe('On affiche', function () {

      let $challenge;

      before(function () {
        $challenge = findWithAssert('.challenge-preview');
      });

      it("37.6. la consigne de l'épreuve", function () {
        expect($challenge.find('.challenge-instruction').html()).to.contain("Que peut-on dire des œufs de catégorie A ?");
      });

      it("37.7. un bouton pour accéder à l'épreuve suivante", function () {
        const $validateButton = findWithAssert('.validate-button');
        expect($validateButton.text()).to.contains('Valider');
      });
    });
  });

  describe.skip("Prévisualiser la dernière épreuve dans le cadre d'un test |", function () {

    before(function () {
      visit(`/courses/simple_course_id/preview/challenges/${lastChallengeId}`);
    });

    it("37.8. on n'affiche pas de bouton “Épreuve suivante”", function () {
      expect(find('.challenge-preview a.next-challenge-button')).to.have.lengthOf(0);
    })
  })
});
