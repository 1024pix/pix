// FIXME wuth API resource GET /assessment/:id/progress

/*
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import { debounce } from '@ember/runloop';

async function visitTimedChallenge() {
  await visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  await click('.challenge-item-warning__confirm-btn');
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
    expect(progressBarText()).to.equal('1 / 4');
  });

  it('d1.0b La barre de progression commence à 1, si j\'accède directement à un course', async function() {
    // When
    await visit('/courses/ref_course_id');

    // Then
    const $progressBar = findWithAssert(PROGRESS_BAR_SELECTOR);
    expect($progressBar.text().trim()).to.equal('1 / 4');
  });

  it('d1.1 Je peux valider ma réponse à une épreuve via un bouton "Je valide"', async function() {
    await visitTimedChallenge();
    expect(findWithAssert('.challenge-actions__action-validate')).to.have.lengthOf(1);
  });

  describe('quand je valide ma réponse à une épreuve', function() {

    it('d1.3 Si l\'épreuve que je viens de valider n\'était pas la dernière du test, je suis redirigé vers l\'épreuve suivante (et la barre de progression est mise à jour)', function() {
      // given
      visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
      click('.challenge-item-warning__confirm-btn');

      // when
      click('.challenge-actions__action-validate');

      // then
      andThen(() => {
        debounce(this, () => {
          expect(currentURL()).to.contain('/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id');
          expect(findWithAssert('.pix-progress-bar').text().trim()).to.contain('2 / 4');
        }, 150);
      });
    });

    it('d1.5 Si l\'épreuve que je viens de valider était la dernière du test, je suis redirigé vers la page de fin du test', function() {
      // given
      visit('/assessments/ref_assessment_id/challenges/ref_qrocm_challenge_id');

      // when
      click('.challenge-actions__action-validate');

      // then
      andThen(() => {
        debounce(this, () => {
          expect(currentURL()).to.contain('/assessments/ref_assessment_id/results');
        }, 150);
      });
    });
  });

});
*/
