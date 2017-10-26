import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

const TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const NOT_TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id';
const CHALLENGE_ITEM_WARNING_BUTTON = '.challenge-item-warning button';

describe('Acceptance | h2 - Warning prochaine page timée  | ', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('h2- Test affichage ou non de la page avec le warning', function() {

    it('doit cacher le contenu du challenge si l\'épreuve est timée', async function() {
      // When
      await visit(TIMED_CHALLENGE_URL);

      // Then
      expect($('.challenge-statement')).to.have.lengthOf(0);
    });

    it('doit afficher le contenu du challenge si l\'épreuve n\'est pas timée', async function() {
      // When
      await visit(NOT_TIMED_CHALLENGE_URL);

      // Then
      expect($('.challenge-statement')).to.have.lengthOf(1);
    });

    it('vérifier que le timer n\'est pas démarré automatiquement lorsque l\'épreuve est timée', async function() {
      // Given
      await visit(TIMED_CHALLENGE_URL);

      // When
      await visit(NOT_TIMED_CHALLENGE_URL);

      // Then
      expect($('.timeout-jauge')).to.have.lengthOf(0);
    });

    it('le formulaire de signalement n\'est pas affiché pour une épreuve chronométrée tant que l\'usager n\'a pas confirmé être prêt pour l\'épreuve', async function() {
      // Given
      await visit(TIMED_CHALLENGE_URL);

      // Then
      expect($('.feedback-panel')).to.have.lengthOf(0);
    });

  });

  describe('h2-Test comportement lorsque le bouton de confirmation est cliqué', function() {

    beforeEach(function() {
      visit(TIMED_CHALLENGE_URL);
      click(CHALLENGE_ITEM_WARNING_BUTTON);
    });

    it('h2.1- vérifier que le warning est caché ', function() {
      expect($(CHALLENGE_ITEM_WARNING_BUTTON)).to.have.lengthOf(0);
    });

    it('h2.2- vérifier que le contenu de l\'épreuve est affiché', function() {
      expect($('.challenge-statement').css('display')).to.contain('block');
    });

    it('h2.3- vérifier que le timer est démarré ', function() {
      expect($('.timeout-jauge')).to.have.lengthOf(1);
    });

    it('h2.4 le formulaire de signalement est affiché', () => {
      expect($('.feedback-panel')).to.have.lengthOf(1);
    });

  });

  describe('h2-Affichage de la page warning pour 2 epreuves timées du même types (suite au bug US-424)', function() {

    const ASSESSMENT_WITH_TWO_TIMED_CHALLENGE = '/assessments/ref_timed_challenge_assessment_id/challenges/ref_timed_challenge_id';
    const PASS_BUTTON = '.challenge-actions__action-skip';

    it('doit afficher la \'warning page\' même si deux epreuves du même type et timées s\'enchaînent', async function() {
      // given
      await visit(ASSESSMENT_WITH_TWO_TIMED_CHALLENGE);
      await click(CHALLENGE_ITEM_WARNING_BUTTON);

      // when
      await click(PASS_BUTTON);

      // then
      expect($('.challenge-item-warning')).to.have.lengthOf(1);
    });
  });

});
