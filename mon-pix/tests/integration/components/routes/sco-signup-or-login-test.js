import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import { clickByLabel } from '../../../helpers/click-by-label';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Routes | routes/sco-signup-or-login', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.set('toggleFormsVisibility', '');
  });

  test('should display the organization name the user is invited to', async function (assert) {
    // when
    await render(
      hbs`<Routes::ScoSignupOrLogin @organizationName='Organization Aztec' @toggleFormsVisibility='toggleFormsVisibility' />`,
    );

    // then
    assert.ok('Organization Aztec vous invite à rejoindre Pix');
  });

  test('should contain an open register form and closed login form', async function (assert) {
    // when
    await render(
      hbs`<Routes::ScoSignupOrLogin @displayRegisterForm={{true}} @toggleFormsVisibility='toggleFormsVisibility' />`,
    );

    // then
    assert.dom('.register-form').exists();
    assert.dom('.login-form').doesNotExist();
  });

  test('should open the login panel and close the register panel when clicking on login button', async function (assert) {
    // given
    await render(
      hbs`<Routes::ScoSignupOrLogin @displayRegisterForm={{false}} @toggleFormsVisibility='toggleFormsVisibility' />`,
    );

    // when
    await clickByLabel(t('pages.sco-signup-or-login.login-form.button'));

    // then
    assert.dom('.register-form').doesNotExist();
    assert.dom('.login-form').exists();
  });
});
