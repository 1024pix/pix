/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve, reject } from 'rsvp';
import Service from '@ember/service';
import { clickByLabel } from '../../helpers/click-by-label';
import { contains } from '../../helpers/contains';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | password reset demand form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<PasswordResetDemandForm />`);
    assert.dom('.sign-form__container').exists();
  });

  test('renders all the necessary elements of the form ', async function (assert) {
    // when
    await render(hbs`<PasswordResetDemandForm />`);

    // then
    assert.dom('.pix-logo__link').exists();
    assert.dom('.sign-form-title').exists();
    assert.dom('.sign-form-header__instruction').exists();
    assert.dom('.sign-form__body').exists();
    assert.dom('.form-textfield__label').exists();
    assert.dom('.form-textfield__input-field-container').exists();
    assert.ok(contains(this.intl.t('pages.password-reset-demand.actions.reset')));
  });

  test('should display error message when there is an error on password reset demand', async function (assert) {
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
    await clickByLabel(this.intl.t('pages.password-reset-demand.actions.reset'));

    // then
    assert.dom('div[id="password-reset-demand-failed-message"]').exists();
  });

  test('should display success message when there is no error on password reset demand', async function (assert) {
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
    await clickByLabel(this.intl.t('pages.password-reset-demand.actions.reset'));

    // then
    assert.dom('div[id="password-reset-demand-failed-message"]').doesNotExist();
    assert.dom('.password-reset-demand-form__body').exists();
  });

  test('should show error coming from errors service', async function (assert) {
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
    const screen = await render(hbs`<PasswordResetDemandForm />`);

    // then
    assert.dom(screen.getByText(expectedError)).exists();
  });
});
