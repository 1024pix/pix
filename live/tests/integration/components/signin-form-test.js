import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | signin form', function() {
  setupComponentTest('signin-form', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{signin-form}}`);

    expect(this.$()).to.have.length(1);
  });
});
