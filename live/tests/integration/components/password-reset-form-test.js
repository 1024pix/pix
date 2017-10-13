import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | password reset form', function() {
  setupComponentTest('password-reset-form', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{password-reset-form}}`);
    expect(this.$()).to.have.length(1);
  });

  it('renders all the necessary elements of the form ', function() {
    // when
    this.render(hbs`{{password-reset-form}}`);

    // then
    expect(this.$('.password-reset__connexion-link')).to.have.length(1);
    expect(this.$('.password-reset-form__pix-logo')).to.have.length(1);
    expect(this.$('.password-reset-form__title')).to.have.length(1);
    expect(this.$('.password-reset-form__text')).to.have.length(1);
    expect(this.$('.password-reset-form__form')).to.have.length(1);
    expect(this.$('.password-reset-form__form-label')).to.have.length(1);
    expect(this.$('.password-reset-form__form-input')).to.have.length(1);
    expect(this.$('.password-reset-form__button')).to.have.length(1);
  });

  it('should display error message when there is an error on password reset demand', function() {
    // given
    this.set('_displayErrorMessage', true);

    // when
    this.render(hbs`{{password-reset-form _displayErrorMessage=_displayErrorMessage}}`);

    // then
    expect(this.$('.password-reset-form__form-error-message')).to.have.length(1);
  });

  it('should display success message when there is an error on password reset demand', function() {
    // given
    this.set('_displaySuccessMessage', true);

    // when
    this.render(hbs`{{password-reset-form _displaySuccessMessage=_displaySuccessMessage}}`);

    // then
    expect(this.$('.password-reset-form__form-success-message')).to.have.length(1);
  });

});
