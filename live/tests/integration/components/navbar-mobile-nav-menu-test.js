import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar mobile nav menu', function() {
  setupComponentTest('navbar-mobile-menu', {
    integration: true
  });

  it('should be rendered', function() {
    // when
    this.render(hbs`{{navbar-mobile-menu}}`);

    // then
    expect(this.$()).to.have.length(1);
  });
});
