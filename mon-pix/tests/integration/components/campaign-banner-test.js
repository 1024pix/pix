import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | campaign-banner', function() {
  setupComponentTest('campaign-banner', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{campaign-banner}}`);
    expect(this.$()).to.have.length(1);
  });
});
