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

function getValidateActionLink () {
 return $('a.challenge-item-actions__validate-action')[0];
}

describe('Acceptance | d1 - Valider une épreuve |', function () {

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
    return visit(`/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id`);
  });

  before(function () {
    $progressBar = findWithAssert('.pix-progress-bar');
  });

  it("d1.0 La barre de progression commence à 1", function () {
    const expectedText = "1";
    expect($progressBar.text()).to.contains(expectedText);
  });
  it("d1.1 Je peux valider ma réponse à une épreuve via un bouton 'Je valide'", function () {
    expect(findWithAssert('a.challenge-item-actions__validate-action')).to.have.lengthOf(1);
  });

  describe("quand je valide ma réponse à une épreuve", function () {

    it("d1.3 Si l'épreuve que je viens de valider n'était pas la dernière du test, je suis redirigé vers l'épreuve suivante", function () {
      return click('.challenge-proposal:first input[type="checkbox"]').then(() => {
        const $validateButton = getValidateActionLink();
        return click($validateButton).then(() => {
          expect(currentURL()).to.contains(`/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id`);
        });
      });
    });

    it("d1.4 La barre de progression avance d'une unité, de 1 à 2.", function () {
      const expectedText = "2";
      expect($progressBar.text()).to.contains(expectedText);
    });

    it("d1.5 Si l'épreuve que je viens de valider était la dernière du test, je suis redirigé vers la page de fin du test", function () {
      visit(`/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id`).then(() => {
        fillIn('input[name="logiciel"]', 'COUCOU').then(() => {
          const $validateButton = getValidateActionLink();
          return click($validateButton).then(() => {
            expect(currentURL()).to.contains(`/assessments/ref_assessment_id/results`);
          });
        });
      });
    });
  });

});
