import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | FirstPageComponent', function() {

  setupComponentTest('first-page', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{first-page}}`);
    expect(this.$()).to.have.length(1);
  });

});
