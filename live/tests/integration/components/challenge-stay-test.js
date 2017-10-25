import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | challenge stay', function() {

  setupComponentTest('challenge-stay', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{challenge-stay}}`);
    expect(this.$()).to.have.lengthOf(1);
  });

  it('should display a warning icon with an accessible description', function() {
    // when
    this.render(hbs`{{challenge-stay}}`);

    // then
    const $img = this.$('.challenge-stay__icon-img');
    expect($img).to.have.lengthOf(1);
    expect($img.attr('src')).to.equal('/images/icon-warning.svg');
    expect($img.attr('alt')).to.not.be.empty;
  });
});
