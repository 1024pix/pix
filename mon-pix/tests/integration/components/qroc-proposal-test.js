import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QROC proposal', function() {

  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{qroc-proposal}}`);
    expect(find('.qroc-proposal')).to.exist;
  });

  describe('When format is a paragraph', function() {

    it('should display a textarea', async function() {
      // given
      this.set('proposals', '${myInput}');
      this.set('format', 'paragraphe');

      // when
      await render(hbs`{{qroc-proposal proposals=proposals format=format}}`);

      // then
      expect(find('.challenge-response__proposal-input')).to.not.exist;
      expect(find('.challenge-response__proposal-textarea').tagName).to.equal('TEXTAREA');
    });
  });

  describe('When format is not a paragraph', function() {

    [
      { format: 'petit', expectedSize: '10' },
      { format: 'mots', expectedSize: '20' },
      { format: 'phrase', expectedSize: '50' },
      { format: 'unreferenced_format', expectedSize: '20' }
    ].forEach((data) => {
      it(`should display an input with expected size (${data.expectedSize}) when format is ${data.format}`, async function() {
        // given
        this.set('proposals', '${myInput}');
        this.set('format', data.format);

        // when
        await render(hbs`{{qroc-proposal proposals=proposals format=format}}`);

        // then
        expect(find('.challenge-response__proposal-textarea')).to.not.exist;
        expect(find('.challenge-response__proposal-input').tagName).to.equal('INPUT');
        expect(find('.challenge-response__proposal-input').getAttribute('size')).to.equal(data.expectedSize);
      });
    });

  });

  describe('Whatever the format', function() {
    [
      { format: 'mots', cssClass: '.challenge-response__proposal-input', inputType: 'input' },
      { format: 'unreferenced_format', cssClass: '.challenge-response__proposal-input', inputType: 'input' },
      { format: 'paragraphe', cssClass: '.challenge-response__proposal-textarea', inputType: 'textarea' },
    ].forEach((data) => {
      describe(`Component behavior when the user clicks on the ${data.inputType}:`, function() {
        it('should not display autocompletion answers', async function() {
          // given
          const proposals = '${myInput}';
          this.set('proposals', proposals);
          this.set('answerValue', '');
          this.set('format', `${data.format}`);

          // when
          await render(hbs`{{qroc-proposal proposals=proposals format=format answerValue=answerValue}}`);
          // then
          expect(find(`${data.cssClass}`).getAttribute('autocomplete')).to.equal('off');
        });
      });

      describe('Component behavior when user fill input of challenge:', function() {

        it('should display a value when a non-empty value is providing by user', async function() {
          // given
          const proposals = '${myInput}';
          this.set('proposals', proposals);
          this.set('answerValue', 'myValue');
          this.set('format', `${data.format}`);

          // when
          await render(hbs`{{qroc-proposal proposals=proposals format=format answerValue=answerValue}}`);
          // then
          expect(find(`${data.cssClass}`).value).to.equal('myValue');
        });
      });

      describe('Component behavior when user skip challenge:', function() {

        [
          { input: 'aband', output: 'aband' },
          { input: '#aband#', output: '#aband#' },
          { input: 'aband#', output: 'aband#' },
          { input: 'ABAND', output: 'ABAND' },
          { input: '#ABAND', output: '#ABAND' },
          { input: 'ABAND#', output: 'ABAND#' },
          { input: '#ABAND#', output: '' },
          { input: '', output: '' }
        ].forEach(({ input, output }) => {

          it(`should display '' value ${input} is providing to component`, async function() {
            // given
            this.set('proposals', '${myLabel}');
            this.set('answerValue', input);
            this.set('format', `${data.format}`);

            // when
            await render(hbs`{{qroc-proposal proposals=proposals format=format answerValue=answerValue}}`);
            // then
            expect(find(`${data.cssClass}`).value).to.be.equal(output);
          });

        });
      });
    });
  });
});
