import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QROCm proposal', function() {

  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{qrocm-proposal}}`);

    expect(find('.qrocm-proposal')).to.exist;
  });

  describe('When format is a paragraph', function() {
    it('should display a textarea', async function() {
      // given
      this.set('proposals', '${myInput}');
      this.set('format', 'paragraphe');

      // when
      await render(hbs`{{qrocm-proposal proposals=proposals format=format}}`);

      // then
      expect(find('.challenge-response__proposal--paragraph').tagName).to.equal('TEXTAREA');
    });
  });

  describe('When format is a sentence', function() {
    it('should display a input', async function() {
      // given
      this.set('proposals', '${myInput}');
      this.set('format', 'phrase');

      // when
      await render(hbs`{{qrocm-proposal proposals=proposals format=format}}`);

      // then
      expect(find('.challenge-response__proposal--sentence').tagName).to.equal('INPUT');
    });
  });

  describe('When format is a neither a paragraph nor a sentence', function() {
    [
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
      { format: 'unreferenced_format', expectedSize: '20' }
    ].forEach((data) => {
      it(`should display an input with expected size (${data.expectedSize}) when format is ${data.format}`, async function() {
        // given
        this.set('proposals', '${myInput}');
        this.set('format', data.format);

        // when
        await render(hbs`{{qrocm-proposal proposals=proposals format=format}}`);

        // then
        expect(find('.challenge-response__proposal--paragraph')).to.not.exist;
        expect(find('.challenge-response__proposal').tagName).to.equal('INPUT');
        expect(find('.challenge-response__proposal').getAttribute('size')).to.equal(data.expectedSize);
      });
    });
  });

  describe('Whatever the format', function() {
    [
      { format: 'mots', cssClass: '.challenge-response__proposal', inputType: 'input' },
      { format: 'phrase', cssClass: '.challenge-response__proposal--sentence', inputType: 'input' },
      { format: 'paragraphe', cssClass: '.challenge-response__proposal--paragraph', inputType: 'textarea' },
      { format: 'unreferenced_format', cssClass: '.challenge-response__proposal', inputType: 'input' },
    ].forEach((data) => {
      describe(`Component behavior when the user clicks on the ${data.inputType}`, function() {

        it('should not display autocompletion answers', async function() {
          // given
          const proposals = '${myInput}';
          this.set('proposals', proposals);
          this.set('answerValue', '');
          this.set('format', `${data.format}`);

          // when
          await render(hbs`{{qrocm-proposal proposals=proposals format=format answerValue=answerValue}}`);

          // then
          expect(find(`${data.cssClass}`).getAttribute('autocomplete')).to.equal('off');
        });
      });
    });

    [
      { proposals: '${input}', expectedAriaLabel: ['Réponse 1'] },
      { proposals: '${rep1}, ${rep2} ${rep3}', expectedAriaLabel: ['Réponse 1', 'Réponse 2', 'Réponse 3'] },
      { proposals: 'Réponses :↵${rep1}\n${rep2}', expectedAriaLabel: ['Réponse 1', 'Réponse 2'] },
      { proposals: 'Vidéo : ${video#.ex1} ${video2#.ex2}\nImage : ${image} ${image2}', expectedAriaLabel: ['Réponse 1', 'Réponse 2', 'Réponse 3', 'Réponse 4'] },
      { proposals: 'Le protocole ${https} assure que la communication entre l\'ordinateur d\'Adèle et le serveur de la banque est ${sécurisée}.', expectedAriaLabel: ['Réponse 1', 'Réponse 2'] },
      { proposals: '- ${NumA} Il classe les pages trouvées pour les présenter\n- ${NumB} Il sélectionne  les pages correspondant aux mots', expectedAriaLabel: ['Réponse 1', 'Réponse 2'] },
    ].forEach((data) => {
      describe(`Component aria-label accessibility when proposal is ${data.proposals}`, function() {
        beforeEach(async function() {
          // given
          this.set('proposals', data.proposals);
          this.set('answerValue', '');
          this.set('format', 'phrase');

          // when
          await render(hbs`{{qrocm-proposal proposals=proposals format=format answerValue=answerValue}}`);
        });

        it('should have an aria-label', async function() {
          // then
          expect(findAll('.challenge-response__proposal').length).to.be.above(0);
          findAll('.challenge-response__proposal').forEach((element, index) => {
            expect(element.getAttribute('aria-label')).to.equal(data.expectedAriaLabel[index]);
          });
        });

        it('should not have a label', async function() {
          // then
          expect(find('label')).to.be.null;
        });
      });
    });

    [
      { proposals: 'texte : ${rep1}\nautre texte : ${rep2}', expectedLabel: ['texte :', 'autre texte :'] },
    ].forEach((data) => {
      describe(`Component label accessibility when proposal is ${data.proposals}`, function() {

        beforeEach(async function() {
          // given
          this.set('proposals', data.proposals);
          this.set('answerValue', '');
          this.set('format', 'phrase');

          // when
          await render(hbs`{{qrocm-proposal proposals=proposals format=format answerValue=answerValue}}`);
        });

        it('should have a label', async function() {
          // then
          expect(findAll('label').length).to.be.above(0);
          findAll('label').forEach((element, index) => {
            expect(element.textContent).to.equal(data.expectedLabel[index]);
          });
        });

        it('should not have an aria-label', async function() {
          // then
          expect(find('.challenge-response__proposal').getAttribute('aria-label')).to.be.null;
        });

        it('should connect the label with the input', async function() {
          // then
          expect(findAll('.challenge-response__proposal').length).to.be.above(0);
          expect(findAll('.challenge-response__proposal').length).to.equal(findAll('label').length);
          findAll('.challenge-response__proposal').forEach((element, index) => {
            const expectedInputId = findAll('.challenge-response__proposal')[index].getAttribute('id');
            expect(findAll('label')[index].getAttribute('for')).to.equal(expectedInputId);
          });
        });
      });
    });
  });
});
