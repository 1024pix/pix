import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { clickByLabel } from '../../../helpers/click-by-label';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Routes | routes/login-or-register', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.set('toggleFormsVisibility', '');
  });

  test('should display the organization name the user is invited to', async function (assert) {
    // when
    await render(
      hbs`<Routes::LoginOrRegister @organizationName="Organization Aztec" @toggleFormsVisibility="toggleFormsVisibility" />`,
    );

    // then
    assert.ok('Organization Aztec vous invite à rejoindre Pix');
  });

  test('should contain an open register form and closed login form', async function (assert) {
    // when
    await render(
      hbs`<Routes::LoginOrRegister @displayRegisterForm={{true}} @toggleFormsVisibility="toggleFormsVisibility" />`,
    );

    // then
    assert.dom('.register-form').exists();
    assert.dom('.login-form').doesNotExist();
  });

  test('should open the login panel and close the register panel when clicking on login button', async function (assert) {
    // given
    await render(
      hbs`<Routes::LoginOrRegister @displayRegisterForm={{false}} @toggleFormsVisibility="toggleFormsVisibility" />`,
    );

    // when
    await clickByLabel(this.intl.t('pages.login-or-register.login-form.button'));

    // then
    assert.dom('.register-form').doesNotExist();
    assert.dom('.login-form').exists();
  });
});
