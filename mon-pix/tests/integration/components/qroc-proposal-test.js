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

  describe('Component behavior when the user clicks on the input:', function() {

    it('should not display autocompletion answers', async function() {
      // given
      const proposals = '${myInput}';
      this.set('proposals', proposals);
      this.set('answerValue', '');
      // when
      await render(hbs`{{qroc-proposal proposals=proposals answerValue=answerValue}}`);
      // then
      expect(find('.challenge-response__proposal-input').getAttribute('autocomplete')).to.equal('off');
    });
  });

  describe('Component behavior when user fill input of challenge:', function() {

    it('should display a value when a non-empty value is providing by user', async function() {
      // given
      const proposals = '${myInput}';
      this.set('proposals', proposals);
      this.set('answerValue', 'myValue');
      // when
      await render(hbs`{{qroc-proposal proposals=proposals answerValue=answerValue}}`);
      // then
      expect(find('.challenge-response__proposal-input').value).to.equal('myValue');
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
        // when
        await render(hbs`{{qroc-proposal proposals=proposals answerValue=answerValue}}`);
        // then
        expect(find('.challenge-response__proposal-input').value).to.be.equal(output);
      });

    });
  });

});
