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

    expect(this.$()).to.have.length(1);
  });

});
