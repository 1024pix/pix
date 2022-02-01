import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Challenge item QROC', function () {
  setupIntlRenderingTest();

  beforeEach(function () {
    this.set('assessment', {
      hasTimeoutChallenge: false,
    });
  });

  it('should render the form', async function () {
    this.set('challenge', {
      timer: false,
    });
    this.set('answer', null);

    await render(
      hbs`<ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}}/>`
    );

    expect(find('.qroc-proposal')).to.exist;
  });

  describe('When format is a paragraph', function () {
    it('should display a textarea', async function () {
      // given
      this.set('challenge', {
        timer: false,
        format: 'paragraphe',
        proposals: '${myInput}',
      });
      this.set('answer', {});

      // when
      await render(
        hbs`<ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`
      );

      // then
      expect(find('.challenge-response__proposal--paragraph').tagName).to.equal('TEXTAREA');
    });
  });

  describe('When format is a sentence', function () {
    it('should display an input', async function () {
      // given
      this.set('challenge', {
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      });
      this.set('answer', {});

      // when
      await render(
        hbs`<ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`
      );

      // then
      expect(find('.challenge-response__proposal--sentence').tagName).to.equal('INPUT');
    });
  });

  describe('When format is a number', function () {
    it('should display an input with number type', async function () {
      // given
      this.set('challenge', {
        timer: false,
        format: 'nombre',
        proposals: '${myInput}',
      });
      this.set('answer', {});

      // when
      await render(
        hbs`<ChallengeItemQroc  @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`
      );

      // then
      expect(find('.challenge-response__proposal').getAttribute('type')).to.equal('number');
    });
  });

  describe('When format is neither a paragraph nor a phrase', function () {
    [
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
      { format: 'unreferenced_format', expectedSize: '20' },
    ].forEach((data) => {
      it(`should display an input with expected size (${data.expectedSize}) when format is ${data.format}`, async function () {
        // given
        this.set('challenge', {
          timer: false,
          format: data.format,
          proposals: '${myInput}',
        });
        this.set('answer', {});

        // when
        await render(
          hbs`<ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`
        );

        // then
        expect(find('.challenge-response__proposal--paragraph')).to.not.exist;
        expect(find('.challenge-response__proposal--sentence')).to.not.exist;
        expect(find('.challenge-response__proposal').tagName).to.equal('INPUT');
        expect(find('.challenge-response__proposal').getAttribute('size')).to.equal(data.expectedSize);
      });
    });
  });

  describe('Whatever the format', function () {
    [
      { format: 'mots', cssClass: '.challenge-response__proposal', inputType: 'input' },
      { format: 'phrase', cssClass: '.challenge-response__proposal--sentence', inputType: 'input' },
      { format: 'paragraphe', cssClass: '.challenge-response__proposal--paragraph', inputType: 'textarea' },
      { format: 'unreferenced_format', cssClass: '.challenge-response__proposal', inputType: 'input' },
    ].forEach((data) => {
      describe(`Component behavior when the user clicks on the ${data.inputType}:`, function () {
        it('should not display autocompletion answers', async function () {
          // given
          this.set('challenge', {
            timer: false,
            format: data.format,
            proposals: '${myInput}',
          });
          this.set('answer', { value: '' });

          // when
          await render(
            hbs`<ChallengeItemQroc  @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}}/>`
          );

          // then
          expect(find(data.cssClass).getAttribute('autocomplete')).to.equal('nope');
        });
      });

      describe('Component behavior when user fill input of challenge:', function () {
        it('should display a value when a non-empty value is providing by user', async function () {
          // given
          this.set('challenge', {
            timer: false,
            format: data.format,
            proposals: '${myInput}',
          });
          this.set('answer', { value: 'myValue' });

          // when
          await render(
            hbs`<ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}}/>`
          );

          // then
          expect(find(data.cssClass).value).to.equal('myValue');
        });
      });

      describe('Component behavior when user skip challenge:', function () {
        [
          { input: 'aband', output: 'aband' },
          { input: '#aband#', output: '#aband#' },
          { input: 'aband#', output: 'aband#' },
          { input: 'ABAND', output: 'ABAND' },
          { input: '#ABAND', output: '#ABAND' },
          { input: 'ABAND#', output: 'ABAND#' },
          { input: '#ABAND#', output: '' },
          { input: '', output: '' },
        ].forEach(({ input, output }) => {
          it(`should display '' value ${input} is providing to component`, async function () {
            // given
            this.set('challenge', {
              timer: false,
              format: data.format,
              proposals: '${myInput}',
            });
            this.set('answer', { value: input });

            // when
            await render(
              hbs`<ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`
            );

            // then
            expect(find(data.cssClass).value).to.be.equal(output);
          });
        });
      });
    });
  });
});
