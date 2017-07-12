import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

async function visitTimedChallenge() {
  await visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  await click('.challenge-item-warning button');
}

function progressBarText() {
  const PROGRESS_BAR_SELECTOR = '.pix-progress-bar';
  return findWithAssert(PROGRESS_BAR_SELECTOR).text().trim();
}

describe('Acceptance | d1 - Valider une épreuve |', function() {

  let application;
  const PROGRESS_BAR_SELECTOR = '.pix-progress-bar';

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('d1.0a La barre de progression commence à 1, si j\'accède au challenge depuis l\'url directe', async function() {
    await visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
    expect(progressBarText()).to.equal('1 / 5');
  });

  it('d1.0b La barre de progression commence à 1, si j\'accède directement à un course', async function() {
    // When
    await visit('/courses/ref_course_id');

    // Then
    const $progressBar = findWithAssert(PROGRESS_BAR_SELECTOR);
    expect($progressBar.text().trim()).to.equal('1 / 5');
  });

  it('d1.1 Je peux valider ma réponse à une épreuve via un bouton "Je valide"', async function() {
    await visitTimedChallenge();
    expect(findWithAssert('.challenge-actions__action-validate')).to.have.lengthOf(1);
  });

  describe('quand je valide ma réponse à une épreuve', function() {
    beforeEach(async function() {
      // Given
      await visitTimedChallenge();
      await click('.proposal-text');
      await click('.challenge-actions__action-validate');
    });

    it('d1.3 Si l\'épreuve que je viens de valider n\'était pas la dernière du test, je suis redirigé vers l\'épreuve suivante', async function() {
      expect(currentURL()).to.contain('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
    });

    it('d1.4 La barre de progression avance d\'une unité, de 1 à 2.', async function() {

      // Then
      const expectedText = '2';
      expect(findWithAssert('.pix-progress-bar').text()).to.contain(expectedText);
    });

    it('d1.5 Si l\'épreuve que je viens de valider était la dernière du test, je suis redirigé vers la page de fin du test', async function() {
      await visit('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
      await click('.challenge-response__proposal-input');
      await click('.challenge-actions__action-validate');
      expect(currentURL()).to.contain('/assessments/ref_assessment_id/results');
    });
  });

});
