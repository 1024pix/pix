/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { fillIn, find, render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve, reject } from 'rsvp';
import Service from '@ember/service';

describe('Integration | Component | password reset demand form', function() {
  setupIntlRenderingTest();

  it('renders', async function() {
    await render(hbs`<PasswordResetDemandForm />`);
    expect(find('.sign-form__container')).to.exist;
  });

  it('renders all the necessary elements of the form ', async function() {
    // when
    await render(hbs`<PasswordResetDemandForm />`);

    // then
    expect(find('.pix-logo__link')).to.exist;
    expect(find('.sign-form-title')).to.exist;
    expect(find('.sign-form-header__instruction')).to.exist;
    expect(find('.sign-form__body')).to.exist;
    expect(find('.form-textfield__label')).to.exist;
    expect(find('.form-textfield__input-field-container')).to.exist;
    expect(find('.button')).to.exist;
  });

  it('should display error message and re enable the button when there is an error on password reset demand', async function() {
    // given
    const storeStub = Service.extend({
      createRecord() {
        return Object.create({
          save() {
            return reject();
          },
        });
      },
    });
    this.owner.unregister('service:store');
    this.owner.register('service:store', storeStub);
    await render(hbs`<PasswordResetDemandForm />`);

    // when
    await fillIn('#email', 'test@example.net');
    await click('.sign-form-body__bottom-button .button');

    // then
    expect(find('.sign-form__notification-message--error')).to.exist;
    expect(find('.button').textContent.trim()).to.equal('Réinitialiser mon mot de passe');
  });

  it('should display success message when there is no error on password reset demand', async function() {
    // given
    const storeStub = Service.extend({
      createRecord() {
        return Object.create({
          save() {
            return resolve();
          },
        });
      },
    });
    this.owner.unregister('service:store');
    this.owner.register('service:store', storeStub);
    await render(hbs`<PasswordResetDemandForm />`);

    // when
    await fillIn('#email', 'test@example.net');
    await click('.sign-form-body__bottom-button .button');

    // then
    expect(find('.password-reset-demand-form__body')).to.exist;
  });

  it('should show error coming from errors service', async function() {
    // given
    const expectedError = 'expected error';
    const errorsServiceStub = Service.extend({
      hasErrors() {
        return true;
      },
      shift() {
        return expectedError;
      },
    });
    this.owner.register('service:errors', errorsServiceStub);

    // when
    await render(hbs`<PasswordResetDemandForm />`);

    // then
    expect(find('.sign-form__notification-message--error').textContent).to.include(expectedError);
  });
});
