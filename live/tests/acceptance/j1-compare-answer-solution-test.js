import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

// see http://stackoverflow.com/a/7349478/2595513
function charCount(str) {
  return str.match(/[a-zA-Z]/g).length;
}

describe('Acceptance | j1 - Comparer réponses et solutions pour un QCM |', function() {

  const RESULT_URL = '/assessments/ref_assessment_id/results';
  const COMPARISON_MODAL_URL = '/assessments/ref_assessment_id/results/compare/ref_answer_qcm_id/1';

  const TEXT_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__title-text';
  const INDEX_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__result-item-index';

  const TEXT_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__instruction';
  const IMAGE_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__illustration-section';

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('j1.1 Affiche sur la ligne de l\'épreuve le mot REPONSE pour un QCM sur l\'écran des résultats', function() {
    it('j1.1.1 il l\'affiche pour un QCM, un QCU mais pas pour les autres types d\'épreuves' , async function() {
      await visit(RESULT_URL);
      expect($('.result-item:eq(0) .js-correct-answer').text()).to.contain('RÉPONSE'); //QCM
      expect($('.result-item:eq(1) .js-correct-answer').text()).to.contain('RÉPONSE'); //QCU
      expect($('.result-item:eq(2) .js-correct-answer').text()).not.to.contain('RÉPONSE'); //QRU
      expect($('.result-item:eq(3) .js-correct-answer').text()).to.contain('RÉPONSE'); //QROC
      expect($('.result-item:eq(4) .js-correct-answer').text()).not.to.contain('RÉPONSE'); //QROCM
    });
  });

  describe('j1.2 Accès à la modale', function() {

    it('j1.2.1 Si on clique sur REPONSE la modale s\'ouvre', async function() {
      await visit(RESULT_URL);
      expect($('.comparison-window')).to.have.lengthOf(0);
      await click('.result-item__correction__button');
      expect($('.comparison-window')).to.have.lengthOf(1);
      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('j1.2.2 On peut accèder directement à la modale via URL et fermer la modale', async function() {
      await visit(COMPARISON_MODAL_URL);
      expect($('.comparison-window')).to.have.lengthOf(1);
      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });
  });

  describe('j1.3 Contenu de la modale : résultat & instruction', function() {

    it('j1.3.1 Vérification de l\'index, ainsi que l\'image et le texte du résultat dans le header', async function() {

      await visit(RESULT_URL);
      expect($(INDEX_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
      expect($(TEXT_OF_RESULT_SELECTOR)).to.have.lengthOf(0);

      await visit(COMPARISON_MODAL_URL);
      expect($(INDEX_OF_RESULT_SELECTOR).text().replace(/\n/g, '').trim()).to.equal('1');

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('j1.3.2 Vérification de la présence de l\'instruction, texte et image', async function() {

      await visit(RESULT_URL);
      expect($(TEXT_OF_INSTRUCTION_SELECTOR)).to.exist;
      expect($(IMAGE_OF_INSTRUCTION_SELECTOR)).to.exist;

      await visit(COMPARISON_MODAL_URL);
      expect(charCount($(TEXT_OF_INSTRUCTION_SELECTOR).text())).to.be.above(5);// XXX : Above 5 means "must be a sentence"
      expect($(IMAGE_OF_INSTRUCTION_SELECTOR)).to.have.lengthOf(1);

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

  });

});
