import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  click('.challenge-item-warning button');
}

describe('Acceptance | d1 - Valider une épreuve |', function() {

  let application;
  const PROGRESS_BAR_SELECTOR = '.pix-progress-bar';
  before(function() {
    application = startApp();
    visitTimedChallenge();
  });

  after(function() {
    destroyApp(application);
  });

  it('d1.0a La barre de progression commence à 1, si j\'accède au challenge depuis l\'url directe', function() {
    const $progressBar = findWithAssert(PROGRESS_BAR_SELECTOR);
    expect($progressBar.text().trim()).to.equal('1 / 5');
  });

  it('d1.0b La barre de progression commence à 1, si j\'accède au challenge depuis depuis le lien Airtable', async function() {
    await visit('/courses/ref_course_id');
    await click('.challenge-item-warning button');
    const $progressBar = findWithAssert(PROGRESS_BAR_SELECTOR);
    expect($progressBar.text().trim()).to.equal('1 / 5');
  });

  it('d1.1 Je peux valider ma réponse à une épreuve via un bouton "Je valide"', function() {
    expect(findWithAssert('.challenge-actions__action-validate')).to.have.lengthOf(1);
  });

  describe('quand je valide ma réponse à une épreuve', function() {

    it('d1.3 Si l\'épreuve que je viens de valider n\'était pas la dernière du test, je suis redirigé vers l\'épreuve suivante', async function() {
      await click('.proposal-text');
      await click('.challenge-actions__action-validate');
      expect(currentURL()).to.contains('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
    });

    it('d1.4 La barre de progression avance d\'une unité, de 1 à 2.', function() {
      const expectedText = '2';
      expect(findWithAssert('.pix-progress-bar').text()).to.contains(expectedText);
    });

    it('d1.5 Si l\'épreuve que je viens de valider était la dernière du test, je suis redirigé vers la page de fin du test', async function() {
      await visit('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');
      await click('.challenge-response__proposal-input');
      await click('.challenge-actions__action-validate');
      expect(currentURL()).to.contains('/assessments/ref_assessment_id/results');
    });
  });

});
