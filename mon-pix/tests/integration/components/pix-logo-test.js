import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | pix logo', function() {

  setupComponentTest('pix-logo', {
    integration: true
  });

  beforeEach(function() {
    this.render(hbs`{{pix-logo}}`);
  });

  it('renders', function() {
    expect(this.$()).to.have.lengthOf(1);
  });

  it('should display the logo', function() {
    expect(this.$('.pix-logo__image').attr('src')).to.equal('/images/pix-logo.svg');
  });

  it('should have a textual alternative', function() {
    expect(this.$('.pix-logo__image').attr('alt')).to.equal('Pix');
  });

  it('should have a title in the link', function() {
    expect(this.$('.pix-logo__link').attr('title')).to.equal('Lien vers la page d\'accueil de PIX');
  });

});
