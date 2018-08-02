import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | no certification panel', function() {
  setupComponentTest('no-certification-panel', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{no-certification-panel}}`);
    expect(this.$()).to.have.length(1);
  });
});
