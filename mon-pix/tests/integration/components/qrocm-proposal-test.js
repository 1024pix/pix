import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QrocmProposalComponent', function() {

  setupComponentTest('qrocm-proposal', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{qrocm-proposal}}`);

    expect(this.$()).to.have.lengthOf(1);
  });

  describe('Component behavior when the user clicks on the input:', function() {

    it('should not display autocompletion answers', function() {
      // given
      const proposals = '${myInput}';
      this.set('proposals', proposals);
      this.set('answerValue', '');
      // when
      this.render(hbs`{{qroc-proposal proposals=proposals answerValue=answerValue}}`);
      // then
      expect(this.$('.challenge-response__proposal-input').attr('autocomplete')).to.equal('off');
    });
  });

});
