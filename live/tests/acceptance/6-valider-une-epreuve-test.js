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

describe('Acceptance | 6 - Valider une épreuve |', function () {

  let application;
  let challenges;

  let lastChallengeId;

  let $progressBar;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/assessments/in_progress_assessment_id/challenges/qcm_challenge_id`);
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

    it("6.3. Si l'épreuve que je viens de valider n'était pas la dernière du test, je suis redirigé vers l'épreuve suivante", function () {
      return click('.challenge-proposal:first input[type="checkbox"]').then(() => {
        const $validateButton = $('.validate-button')[0];
        return click($validateButton).then(() => {
          expect(currentURL()).to.contains(`/assessments/in_progress_assessment_id/challenges/qcu_challenge_id`);
        });
      });
    });

    it("6.4. La barre de progression avance d'une unité, de 1 à 2.", function () {
      const expectedText = "2";
      expect($progressBar.text()).to.contains(expectedText);
    });

    it("6.5. Si l'épreuve que je viens de valider était la dernière du test, je suis redirigé vers la page de fin du test", function () {
      visit(`/assessments/in_progress_assessment_id/challenges/qrocm_challenge_id`).then(() => {
        fillIn('input[name="logiciel"]', 'COUCOU').then(() => {
          const $validateButton = $('.validate-button')[0];
          return click($validateButton).then(() => {
            expect(currentURL()).to.contains(`/assessments/in_progress_assessment_id/results`);
          });
        });
      });
    });
  });

});
