import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QrocmProposalComponent', function() {

  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{qrocm-proposal}}`);

    expect(find('.qrocm-proposal')).to.exist;
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

});
