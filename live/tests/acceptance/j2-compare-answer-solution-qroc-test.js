import { describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | j2 - Comparer réponses et solutions pour un QROC | ', function() {

  const RESULT_URL = '/assessments/ref_assessment_id/results';
  const COMPARISON_MODAL_URL = '/assessments/ref_assessment_id/results/compare/ref_answer_qroc_id/4';

  const TEXT_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__title .comparison-window__title-text';
  const INDEX_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__result-item-index';
  const TEXT_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__instruction';
  const CORRECTION_BOX_QROC = '.comparison-window__corrected-answers--qroc';
  const FEEDBACK_PANEL = '.comparison-window__feedback-panel';

  let application;

  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  describe('j2.1 Depuis la page résultat', function() {

    before(function() {
      visit(RESULT_URL);
    });

    it('affiche le lien REPONSE vers la modale depuis l\'ecran des resultats pour un QROC', async function() {
      expect($('.result-item .js-correct-answer').text()).to.contain('RÉPONSE');
    });

    it('On n\'affiche pas encore la modale, ni son contenu', async function() {
      expect($('.comparison-window')).to.have.lengthOf(0);
      expect($(INDEX_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
      expect($(TEXT_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
    });

  });

  describe('j2.2 Contenu de la modale de correction pour un QROC', function() {

    before(function() {
      visit(COMPARISON_MODAL_URL);
    });

    it('possible d\'accéder à la modale depuis l\'URL', async function() {
      expect($('.comparison-window')).to.have.lengthOf(1);
    });

    it('contient un header', async function() {
      expect($(INDEX_OF_RESULT_SELECTOR).text().replace(/\n/g, '').trim()).to.equal('4');
    });

    it('contient une instruction', async function() {
      expect($(TEXT_OF_INSTRUCTION_SELECTOR)).to.have.lengthOf(1);
    });

    it('contient une zone de correction', async function() {
      expect($(CORRECTION_BOX_QROC)).to.have.lengthOf(1);
    });

    it('contient une zone reservé au feedback panel', async function() {
      expect($(FEEDBACK_PANEL)).to.have.lengthOf(1);
    });

    it('on peut fermer la modale', async function() {
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });
  });

});
