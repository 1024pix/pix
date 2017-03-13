import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | pix logo', function() {

  setupComponentTest('pix-logo', {
    integration: true
  });

  beforeEach(function () {
    this.render(hbs`{{pix-logo}}`);
  });

  it('renders', function() {
    expect(this.$()).to.have.lengthOf(1);
  });

  it('should display the logo', function () {
    expect(this.$('.pix-logo__image').attr('src')).to.equal('images/pix-logo.svg');
  });

  it('should display "béta"', function () {
    expect(this.$().text().trim()).to.equal('Béta');
  });

});
