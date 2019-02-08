import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | password reset demand form', function() {
  setupComponentTest('password-reset-demand-form', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{password-reset-demand-form}}`);
    expect(this.$()).to.have.length(1);
  });

  it('renders all the necessary elements of the form ', function() {
    // when
    this.render(hbs`{{password-reset-demand-form}}`);

    // then
    expect(this.$('.pix-logo__link')).to.have.length(1);
    expect(this.$('.sign-form-header__title')).to.have.length(1);
    expect(this.$('.sign-form-header__instruction')).to.have.length(1);
    expect(this.$('.sign-form__form')).to.have.length(1);
    expect(this.$('.form-textfield__label')).to.have.length(1);
    expect(this.$('.form-textfield__input-field-container')).to.have.length(1);
    expect(this.$('.sign-form__submit-button')).to.have.length(1);
  });

  it('should display error message when there is an error on password reset demand', function() {
    // given
    this.set('_displayErrorMessage', true);

    // when
    this.render(hbs`{{password-reset-demand-form _displayErrorMessage=_displayErrorMessage}}`);

    // then
    expect(this.$('.password-reset-form__form-error-message')).to.have.length(1);
  });

  it('should display success message when there is an error on password reset demand', function() {
    // given
    this.set('_displaySuccessMessage', true);

    // when
    this.render(hbs`{{password-reset-demand-form _displaySuccessMessage=_displaySuccessMessage}}`);

    // then
    expect(this.$('.password-reset-form__form-success-message')).to.have.length(1);
  });

});
