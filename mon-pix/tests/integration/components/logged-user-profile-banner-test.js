import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | logged user profile banner', function() {
  setupComponentTest('logged-user-profile-banner', {
    integration: true
  });

  it('should display a banner', function() {
    // when
    this.render(hbs`{{logged-user-profile-banner}}`);

    // then
    expect(this.$()).to.have.lengthOf(1);
    expect(this.$('.logged-user-profile-banner')).to.have.lengthOf(1);
  });

  it('should have a content text container', function() {
    // when
    this.render(hbs`{{logged-user-profile-banner}}`);

    // then
    expect(this.$('.profile-banner__content-text-container')).to.have.lengthOf(1);
  });

  it('should a button cta to scroll to profile section', function() {
    // when
    this.render(hbs`{{logged-user-profile-banner}}`);

    // then
    expect(this.$('.profile-banner__button-scroll-container')).to.have.lengthOf(1);
    expect(this.$('.button-scroll-to-profile')).to.have.lengthOf(1);
    expect(this.$('.button-scroll-to-profile').text()).to.equal('choisir un test');
  });

});
