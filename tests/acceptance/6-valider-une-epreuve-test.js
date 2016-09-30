import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { beforeEach } from "mocha";

describe('Acceptance | 6 - Valider une épreuve |', function() {

  let application;
  let assessment;
  let challenges;
  let course;

  let assessmentId;
  let firstChallengeId;
  let lastChallengeId;

  before(function() {
    application = startApp();

    challenges = server.createList('challenge-airtable', 2);
    firstChallengeId = challenges[1].attrs.id;
    lastChallengeId = challenges[0].attrs.id;

    course = server.create('course-airtable');
    course.attachMany('Épreuves', challenges);

    assessment = server.create('assessment-airtable');
    assessment.attachOne('Test', course);
    assessmentId = assessment.attrs.id;
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/${assessmentId}/challenges/${firstChallengeId}`);
  });

  before(function () {
    $progressBar = findWithAssert('.pix-progress-bar');
  });

  it("6.0. La barre de progression commence à 1", function () {
    const expectedText = "1";
    expect($progressBar.text()).to.contains(expectedText);
  });
  it("6.1. Je peux valider ma réponse à une épreuve via un bouton 'Valider'", function () {
    expect(findWithAssert('.validate-button')).to.have.lengthOf(1);
  });

  describe("quand je valide ma réponse à une épreuve", function () {

    beforeEach(function () {
      return click('.challenge-proposal:first input[type="radio"]');
    });



    it("6.2. Ma réponse est sauvegardée dans le BO", function () {

    });

    it("6.3. Si l'épreuve que je viens de valider n'était pas la dernière du test, je suis redirigé vers l'épreuve suivante", function () {
      const $validateButton = $('.validate-button')[0];
      return click($validateButton).then(() => {
        expect(currentURL()).to.contains(`/assessments/${assessmentId}/challenges/${lastChallengeId}`);
      });
    });
    it("6.4. La barre de progression avance d'une unité, de 1 à 2.", function () {
      const expectedText = "2";
      expect($progressBar.text()).to.contains(expectedText);
    });

    it("6.5. Si l'épreuve que je viens de valider était la dernière du test, je suis redirigé vers la page de fin du test", function () {
      const $validateButton = $('.validate-button')[0];
      return click($validateButton).then(() => {
        expect(currentURL()).to.contains(`/assessments/${assessmentId}/results`);
      });
    });
  });

});
