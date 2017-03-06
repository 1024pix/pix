import { describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import _ from 'pix-live/utils/lodash-custom';

// see http://stackoverflow.com/a/7349478/2595513
function charCount(str) {
  return str.match(/[a-zA-Z]/g).length;
}

describe('Acceptance | j1 - Comparer réponses et solutions pour un QCM |', function () {

  const RESULT_URL = '/assessments/ref_assessment_id/results';
  const COMPARISON_MODAL_URL = '/assessments/ref_assessment_id/results/compare/ref_answer_qcm_id/1';

  const CSS_BOLD_FONT_WEIGHT = '900';
  const CSS_NORMAL_FONT_WEIGHT = '400';

  const CSS_GREEN_COLOR = 'rgb(19, 201, 160)';
  const CSS_BLACK_COLOR = 'rgb(51, 51, 51)';

  const CSS_LINETHROUGH_ON = 'line-through';
  const CSS_LINETHROUGH_OFF = 'none';


  const TEXT_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__title-text';
  const SVG_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__title svg';
  const INDEX_OF_RESULT_SELECTOR = '.comparison-window__header .comparison-window__result-item-index';

  const TEXT_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__instruction';
  const IMAGE_OF_INSTRUCTION_SELECTOR = '.comparison-window--body .challenge-statement__illustration-section';

  const CHECKBOX_CORRECT_AND_CHECKED = '.comparison-window .comparison-window-boolean:eq(1)';
  const LABEL_CORRECT_AND_CHECKED = '.comparison-window .comparison-window-oracle:eq(1)';

  const CHECKBOX_CORRECT_AND_UNCHECKED = '.comparison-window .comparison-window-boolean:eq(2)';
  const LABEL_CORRECT_AND_UNCHECKED = '.comparison-window .comparison-window-oracle:eq(2)';

  const CHECKBOX_INCORRECT_AND_CHECKED = '.comparison-window .comparison-window-boolean:eq(3)';
  const LABEL_INCORRECT_AND_CHECKED = '.comparison-window .comparison-window-oracle:eq(3)';

  const CHECKBOX_INCORRECT_AND_UNCHECKED = '.comparison-window .comparison-window-boolean:eq(0)';
  const LABEL_INCORRECT_AND_UNCHECKED = '.comparison-window .comparison-window-oracle:eq(0)';


  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe('j1.1 Affiche sur la ligne de l\'épreuve le mot REPONSE pour un QCM sur l\'écran des résultats', function () {
    it('j1.1.1 il l\'affiche pour un QCM mais pas pour les autres types d\'épreuves' , async function () {
      await visit(RESULT_URL);
      expect($('.result-list__item:eq(0) .js-correct-answer').text()).to.contain('RÉPONSE'); //QCM
      expect($('.result-list__item:eq(1) .js-correct-answer').text()).not.to.contain('RÉPONSE'); //QCU
      expect($('.result-list__item:eq(2) .js-correct-answer').text()).not.to.contain('RÉPONSE'); //QRU
      expect($('.result-list__item:eq(3) .js-correct-answer').text()).not.to.contain('RÉPONSE'); //QROC
      expect($('.result-list__item:eq(4) .js-correct-answer').text()).not.to.contain('RÉPONSE'); //QROCM
    });
  });

  describe('j1.2 Accès à la modale', function () {
    it('j1.2.2 On peut accèder directement à la modale via URL et fermer la modale' , async function () {
      await visit(COMPARISON_MODAL_URL);
      expect($('.comparison-window')).to.have.lengthOf(1);
      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });
    it('j1.2.1 Si on clique sur REPONSE la modale s\'ouvre' , async function () {
      await visit(RESULT_URL);
      expect($('.comparison-window')).to.have.lengthOf(0);
      await click('.result-list__correction__button');
      expect($('.comparison-window')).to.have.lengthOf(1);
      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });
  });

  describe('j1.3 Contenu de la modale : résultat & instruction', function () {

    it('j1.3.1 Vérification de l\'index, ainsi que l\'image et le texte du résultat dans le header', async function () {

      await visit(RESULT_URL);
      expect($(INDEX_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
      expect($(SVG_OF_RESULT_SELECTOR)).to.have.lengthOf(0);
      expect($(TEXT_OF_RESULT_SELECTOR)).to.have.lengthOf(0);

      await visit(COMPARISON_MODAL_URL);
      expect($(INDEX_OF_RESULT_SELECTOR).text().replace(/\n/g, '').trim()).to.equal('1');
      expect($(SVG_OF_RESULT_SELECTOR)).to.have.lengthOf(1);
      expect(charCount($(TEXT_OF_RESULT_SELECTOR).text())).to.be.above(5);// XXX : Above 5 means "must be a sentence"

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('j1.3.2 Vérification de la présence de l\'instruction, texte et image', async function () {

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


  describe('j1.4 Contenu de la modale : propositions', function () {

    it('j1.4.1 QCM correcte et cochée', async function () {

      await visit(RESULT_URL);
      expect($(CHECKBOX_CORRECT_AND_CHECKED)).to.exist;
      expect($(LABEL_CORRECT_AND_CHECKED)).to.have.lengthOf(0);

      await visit(COMPARISON_MODAL_URL);
      expect($(CHECKBOX_CORRECT_AND_CHECKED).is(':checked')).to.equal(true);
      expect(charCount($(LABEL_CORRECT_AND_CHECKED).text())).to.be.above(0);
      expect($(LABEL_CORRECT_AND_CHECKED).css('font-weight')).to.equal(CSS_BOLD_FONT_WEIGHT);
      expect($(LABEL_CORRECT_AND_CHECKED).css('color')).to.equal(CSS_GREEN_COLOR);
      expect($(LABEL_CORRECT_AND_CHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_OFF);

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('j1.4.2 QCM correcte et non cochée', async function () {

      await visit(RESULT_URL);
      expect($(CHECKBOX_CORRECT_AND_UNCHECKED)).to.have.lengthOf(0);
      expect($(LABEL_CORRECT_AND_UNCHECKED)).to.have.lengthOf(0);


      await visit(COMPARISON_MODAL_URL);
      expect($(CHECKBOX_CORRECT_AND_UNCHECKED).is(':checked')).to.equal(false);
      expect(charCount($(LABEL_CORRECT_AND_UNCHECKED).text())).to.be.above(0);
      expect($(LABEL_CORRECT_AND_UNCHECKED).css('font-weight')).to.equal(CSS_BOLD_FONT_WEIGHT);
      expect($(LABEL_CORRECT_AND_UNCHECKED).css('color')).to.equal(CSS_GREEN_COLOR);
      expect($(LABEL_CORRECT_AND_UNCHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_OFF);

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('j1.4.3 QCM incorrecte et cochée', async function () {

      await visit(RESULT_URL);
      expect($(CHECKBOX_INCORRECT_AND_CHECKED)).to.have.lengthOf(0);
      expect($(LABEL_INCORRECT_AND_CHECKED)).to.have.lengthOf(0);


      await visit(COMPARISON_MODAL_URL);
      expect($(CHECKBOX_INCORRECT_AND_CHECKED).is(':checked')).to.equal(true);
      expect(charCount($(LABEL_INCORRECT_AND_CHECKED).text())).to.be.above(0);
      expect($(LABEL_INCORRECT_AND_CHECKED).css('font-weight')).to.equal(CSS_NORMAL_FONT_WEIGHT);
      expect($(LABEL_INCORRECT_AND_CHECKED).css('color')).to.equal(CSS_BLACK_COLOR);
      expect($(LABEL_INCORRECT_AND_CHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_ON);

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('j1.4.4 QCM incorrecte et non cochée', async function () {

      await visit(RESULT_URL);
      expect($(CHECKBOX_INCORRECT_AND_UNCHECKED)).to.have.lengthOf(0);
      expect($(LABEL_INCORRECT_AND_UNCHECKED)).to.have.lengthOf(0);


      await visit(COMPARISON_MODAL_URL);
      expect($(CHECKBOX_INCORRECT_AND_UNCHECKED).is(':checked')).to.equal(false);
      expect(charCount($(LABEL_INCORRECT_AND_UNCHECKED).text())).to.be.above(0);
      expect($(LABEL_INCORRECT_AND_UNCHECKED).css('font-weight')).to.equal(CSS_NORMAL_FONT_WEIGHT);
      expect($(LABEL_INCORRECT_AND_UNCHECKED).css('color')).to.equal(CSS_BLACK_COLOR);
      expect($(LABEL_INCORRECT_AND_UNCHECKED).css('text-decoration')).to.equal(CSS_LINETHROUGH_OFF);

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

    it('j1.4.5 Aucune case à cocher n\'est cliquable', async function () {

      await visit(COMPARISON_MODAL_URL);
      const size = $('.comparison-window .comparison-window-boolean').length;
      _.times(size, function(index) {
        expect($('.comparison-window .comparison-window-boolean:eq('+ index + ')').is(':disabled')).to.equal(true);
      });

      // XXX test env needs the modal to be closed manually
      await click('.close-button-container');
      expect($('.comparison-window')).to.have.lengthOf(0);
    });

  });


});
