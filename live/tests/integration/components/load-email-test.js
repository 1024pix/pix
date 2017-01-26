import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | LoadEmailComponent', function() {

  setupComponentTest('load-email', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{load-email}}`);
    expect(this.$()).to.have.length(1);
  });

});
