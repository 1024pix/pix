import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QrocProposal', function() {

  setupComponentTest('qroc-proposal', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{qroc-proposal}}`);
    expect(this.$()).to.have.length(1);
  });

});
