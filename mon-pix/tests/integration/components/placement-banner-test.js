import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | placement-banner', function() {
  setupComponentTest('placement-banner', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{placement-banner}}`);
    expect(this.$()).to.have.length(1);
  });
});
