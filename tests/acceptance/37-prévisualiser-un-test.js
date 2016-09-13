import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import markdownit from 'markdown-it';

describe('Acceptance | 37 - Prévisualiser un test |', function () {

  let challenges;
  let course;
  let courseId;
  let firstChallengeId;
  let secondChallengeId;
  let lastChallengeId;

  let application;

  before(function () {
    application = startApp();
    challenges = server.createList('challenge-airtable', 3);
    course = server.create('course-airtable');
    course.attachMany('Épreuves', challenges);

    courseId = course.attrs.id;
    // XXX order is reversed
    firstChallengeId = challenges[2].attrs.id;
    secondChallengeId = challenges[1].attrs.id;
    lastChallengeId = challenges[0].attrs.id;
  });

  after(function () {
    destroyApp(application);
  });

  describe("Prévisualiser la première page d'un test |", function () {

    before(function () {
      return visit(`/courses/${courseId}/preview`);
    });

    it("37.1. L'accès à la preview d'un test se fait en accédant à l'URL /courses/:course_id/preview", function () {
      expect(currentURL()).to.equal(`/courses/${courseId}/preview`);
    });

    let $preview;

    describe('On affiche', function () {

      before(function () {
        $preview = findWithAssert('#course-preview');
      });

      it('37.2. le nom du test', function () {
        expect($preview.find('.course-name').text()).to.contains(course.attrs.fields.Nom);
      });

      it('37.3. la description du test', function () {
        expect($preview.find('.course-description').text()).to.contains(course.attrs.fields.Description);
      });

      it('37.4. un bouton pour démarrer la simulation du test et qui mène à la première question', function () {
        const $playButton = findWithAssert('.simulate-button');
        expect($playButton.text()).to.be.equals('Simuler le test');
        expect($playButton.attr('href')).to.be.equals(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
      });
    });
  });

  describe("Prévisualiser une épreuve dans le cadre d'un test |", function () {

    let currentChallenge;

    before(function () {
      currentChallenge = challenges[2];
      return visit(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
    });

    it("37.5. L'accès à la preview d'une épreuve d'un testse fait en accédant à l'URL /courses/:course_id/preview/challenges/:challenge_id", function () {
      expect(currentURL()).to.equal(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
    });

    describe('On affiche', function () {

      let $challenge;

      before(function () {
        $challenge = findWithAssert('.challenge-preview');
      });

      it("37.6. la consigne de l'épreuve", function () {
        const expectedMarkdown = markdownit().render(currentChallenge.attrs.fields.Consigne);
        expect($challenge.find('.challenge-instruction').html()).to.equal(expectedMarkdown);
      });

      it("37.7. un bouton pour accéder à l'épreuve suivante", function () {
        const $validateButton = findWithAssert('.validate-button');
        expect($validateButton.text()).to.contains('Valider');
      });
    });
  });

  describe("Prévisualiser la dernière épreuve dans le cadre d'un test |", function () {

    before(function () {
      return visit(`/courses/${courseId}/preview/challenges/${lastChallengeId}`);
    });

    it("37.8. on n'affiche pas de bouton “Épreuve suivante”", function () {
      expect(find('.challenge-preview a.next-challenge-button')).to.have.lengthOf(0);
    })
  })
});
