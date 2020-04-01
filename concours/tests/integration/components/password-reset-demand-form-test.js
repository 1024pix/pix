import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | password reset demand form', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{password-reset-demand-form}}`);
    expect(find('.sign-form__container')).to.exist;
  });

  it('renders all the necessary elements of the form ', async function() {
    // when
    await render(hbs`{{password-reset-demand-form}}`);

    // then
    expect(find('.pix-logo__link')).to.exist;
    expect(find('.sign-form-title')).to.exist;
    expect(find('.sign-form-header__instruction')).to.exist;
    expect(find('.sign-form__body')).to.exist;
    expect(find('.form-textfield__label')).to.exist;
    expect(find('.form-textfield__input-field-container')).to.exist;
    expect(find('.button')).to.exist;
  });

  it('should display error message when there is an error on password reset demand', async function() {
    // given
    this.set('_displayErrorMessage', true);

    // when
    await render(hbs`{{password-reset-demand-form _displayErrorMessage=_displayErrorMessage}}`);

    // then
    expect(find('.sign-form__notification-message--error')).to.exist;
  });

  it('should display success message when there is an error on password reset demand', async function() {
    // given
    this.set('_displaySuccessMessage', true);

    // when
    await render(hbs`{{password-reset-demand-form _displaySuccessMessage=_displaySuccessMessage}}`);

    // then
    expect(find('.password-reset-demand-form__body')).to.exist;
  });

});
