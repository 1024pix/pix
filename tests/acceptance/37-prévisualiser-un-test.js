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
  let courseId;
  let firstChallengeId;
  let secondChallengeId;
  let lastChallengeId;

  let application;

  before(function () {
    application = startApp();
    challenges = server.createList('challenge-airtable', 3);
    course = server.create('course-airtable', { fields: { "Épreuves": challenges } });

    courseId = course.attrs.id;
    firstChallengeId = challenges[0].attrs.id;
    secondChallengeId = challenges[1].attrs.id;
    lastChallengeId = challenges[2].attrs.id;
  });

  after(function () {
    destroyApp(application);
  });

  describe("Prévisualiser la première page d'un test |", function () {

    before(function () {
      return visit(`/courses/${courseId}/preview`);
    });

    it("L'accès à la preview d'un test se fait en accédant à l'URL /courses/:course_id/preview", function () {
      expect(currentURL()).to.equal(`/courses/${courseId}/preview`);
    });

    let $preview;

    describe('On affiche', function () {

      before(function () {
        $preview = findWithAssert('#course-preview');
      });

      it("le titre de la page avec l'identifiant du test", function () {
        expect($preview.find('.title').text()).to.contains(`Prévisualisation du test #${courseId}`);
      });

      it('le nom du test', function () {
        expect($preview.find('.course-name').text()).to.contains(course.attrs.fields.Nom);
      });

      it('la description du test', function () {
        expect($preview.find('.course-description').text()).to.contains(course.attrs.fields.Description);
      });

      it('un bouton pour démarrer la simulation du test et qui mène à la première question', function () {
        const $playButton = findWithAssert('.simulate-button');
        expect($playButton.text()).to.be.equals('Simuler le test');
        expect($playButton.attr('href')).to.be.equals(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
      });
    });
  });

  describe("Prévisualiser une épreuve dans le cadre d'un test |", function () {

    let currentChallenge;

    before(function () {
      currentChallenge = challenges[0];
      return visit(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
    });

    it("L'accès à la preview d'une épreuve d'un testse fait en accédant à l'URL /courses/:course_id/preview/challenges/:challenge_id", function () {
      expect(currentURL()).to.equal(`/courses/${courseId}/preview/challenges/${firstChallengeId}`);
    });

    describe('On affiche', function () {

      let $challenge;

      before(function () {
         $challenge = findWithAssert('.challenge-preview');
      });

      it("l'identifiant de l'épreuve", function () {
        expect($challenge.find('.title').text()).to.contains(`Prévisualisation de l'épreuve #${firstChallengeId}`);
      });

      it("la consigne de l'épreuve", function () {
        expect($challenge.find('.challenge-instruction').text()).to.contains(currentChallenge.attrs.fields.Consigne);
      });

      // FIXME: this should be removed as it's not part of the US (wait for PR validation_
      //it('les propositions sous forme de boutons radio pour un QCU', function () {
      //  const $proposals = findWithAssert('.challenge-proposals input[type="radio"][name="proposals"]');
      //  expect($proposals).to.have.lengthOf(5);
      //});

      it("un bouton pour accéder à l'épreuve suivante", function() {
        const $nextChallengeButton = findWithAssert('.next-challenge-button');
        expect($nextChallengeButton.text()).to.be.equals('Épreuve suivante');
        expect($nextChallengeButton.attr('href')).to.be.equals(`/courses/${courseId}/preview/challenges/${secondChallengeId}`);
      });
    });
  });

  describe("Prévisualiser la dernière épreuve dans le cadre d'un test |", function () {

    before(function () {
      return visit(`/courses/${courseId}/preview/challenges/${lastChallengeId}`);
    });

    it("on n'affiche pas de bouton “Épreuve suivante”", function () {
      expect(find('.challenge-preview a.next-challenge-button')).to.have.lengthOf(0);
    })
  })
});
