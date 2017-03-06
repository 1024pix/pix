import { describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | j2 - Comparer réponses et solutions pour un QROC | ', function () {

  const RESULT_URL = '/assessments/ref_assessment_id/results';
  const COMPARISON_MODAL_URL = '/assessments/ref_assessment_id/results/compare/ref_answer_qroc_id/4';

  const TEXT_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__title .comparison-window__title-text';
  const SVG_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__title svg';
  const INDEX_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__result-item-index';

  const TEXT_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__instruction';

  const CORRECTION_BOX_QROC = '.comparison-window__corrected-answers--qroc';

  const FEEDBACK_LINK = '.comparison-window__feedback-panel';
  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('j2.1 Possibilité de voir la correction d\'un challenge QROC depuis la page résultat', function () {

    it('affiche le lien REPONSE vers la modale depuis l\'ecran des resultats pour un QROC', async function () {
      await visit(RESULT_URL);
      expect($('.result-list__item .js-correct-answer').text()).to.contain('RÉPONSE');
    });

    it('ouvre la modale si on clique sur REPONSE', async function () {
      await visit(RESULT_URL);
      expect($('.comparison-window')).to.have.lengthOf(0);
      await click('.result-list__correction__button');
      expect($('.comparison-window')).to.have.lengthOf(1);
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('possible d\'accéder à la modale depuis l\'URL', async function () {
      await visit(COMPARISON_MODAL_URL);
      expect($('.comparison-window')).to.have.lengthOf(1);
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });
  });

  describe('j2.2 Contenu de la modale de correction pour un QROC', function () {

    it('contient un header', async function () {
      await visit(RESULT_URL);
      expect($(INDEX_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
      expect($(SVG_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
      expect($(TEXT_OF_RESULT_SELECTOR)).to.have.lengthOf(0);

      await visit(COMPARISON_MODAL_URL);
      expect($(INDEX_OF_RESULT_SELECTOR).text().replace(/\n/g, '').trim()).to.equal('4');
      expect($(SVG_OF_RESULT_SELECTOR)).to.have.lengthOf(1);

      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('contient une instruction', async function () {

      await visit(RESULT_URL);
      expect($(TEXT_OF_INSTRUCTION_SELECTOR)).to.have.lengthOf(0);

      await visit(COMPARISON_MODAL_URL);
      expect($(TEXT_OF_INSTRUCTION_SELECTOR)).to.have.lengthOf(1);

      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);

    });

    it('contient une zone de correction', async function () {
      await visit(COMPARISON_MODAL_URL);
      expect($(CORRECTION_BOX_QROC)).to.have.lengthOf(1);

      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('contient un lien vers feedback', async function () {
      await visit(COMPARISON_MODAL_URL);
      expect($(FEEDBACK_LINK)).to.have.lengthOf(1);

      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });
  });

});
