import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

const TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const NOT_TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id';
const CHALLENGE_ITEM_WARNING_BUTTON = '.challenge-item-warning button';

describe('Acceptance | h2 - Warning prochaine page timée  | ', function () {

  let application;

  beforeEach(function () {
    application = startApp();
  });

  afterEach(function () {
    destroyApp(application);
  });

  describe('h2- Test affichage ou non de la page avec le warning', function () {

    beforeEach(function () {
      visit(TIMED_CHALLENGE_URL);
    });

    //XXX: Deux cas car on test aussi une absence d'affichage
    it('h2.1- doit cacher le contenu du challenge si l\'épreuve est timée mais l\'afficher dans le cas contraire ', async function () {
      expect($('.challenge-statement')).to.have.lengthOf(0);
      await visit(NOT_TIMED_CHALLENGE_URL);
      expect($('.challenge-statement')).to.have.lengthOf(1);
    });

    it('h2.2- doit afficher le warning si l\'épreuve est timée mais ne pas l\'afficher dans le cas contraire ', async function () {
      expect($('.challenge-item-warning')).to.have.lengthOf(1);
      await visit(NOT_TIMED_CHALLENGE_URL);
      expect($('.challenge-item-warning')).to.have.lengthOf(0);
    });

    it('h2.3- vérifier que le timer n\'est pas démarré automatiquement lorsque l\'épreuve est timée', function () {
      expect($('.timeout-jauge')).to.have.lengthOf(0);
    });

  });

  describe('h2-Test comportement lorsque le bouton de confirmation est cliqué', function () {

    beforeEach(function () {
      visit(TIMED_CHALLENGE_URL);
      click(CHALLENGE_ITEM_WARNING_BUTTON);
    });

    it('h2.1- vérifier que le warning est caché ', function () {
      expect($(CHALLENGE_ITEM_WARNING_BUTTON)).to.have.lengthOf(0);
    });

    it('h2.2- vérifier que le contenu de l\'épreuve est affiché', function () {
      expect($('.challenge-statement').css('display')).to.contains('block');
    });

    it('h2.3- vérifier que le timer est démarré ', function () {
      expect($('.timeout-jauge')).to.have.lengthOf(1);
    });

  });

  describe('h2-Affichage de la page warning pour 2 epreuves timées du même types (suite au bug US-424)', function () {

    const ASSESSMENT_WITH_TWO_TIMED_CHALLENGE = '/assessments/ref_timed_challenge_assessment_id/challenges/ref_timed_challenge_id';
    const PASS_BUTTON = '.challenge-actions__action-skip';

    it('doit afficher la \'warning page\' même si deux epreuves du même type et timées s\'enchaînent', async function () {
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
