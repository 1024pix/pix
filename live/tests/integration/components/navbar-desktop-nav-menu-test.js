import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar desktop menu', function() {
  setupComponentTest('navbar-desktop-menu', {
    integration: true
  });

  it('should be rendered', function() {
    // when
    this.render(hbs`{{navbar-desktop-menu}}`);

    // then
    expect(this.$()).to.have.length(1);
  });
});
