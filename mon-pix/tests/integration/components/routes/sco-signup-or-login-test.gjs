import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ScoSignupOrLogin from 'mon-pix/components/routes/sco-signup-or-login';
import { module, test } from 'qunit';

import { clickByLabel } from '../../../helpers/click-by-label';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Routes | routes/sco-signup-or-login', function (hooks) {
  setupIntlRenderingTest(hooks);

  const toggleFormsVisibility = '';

  test('should display the organization name the user is invited to', async function (assert) {
    // when
    await render(
      <template>
        <ScoSignupOrLogin @organizationName="Organization Aztec" @toggleFormsVisibility={{toggleFormsVisibility}} />
      </template>,
    );

    // then
    assert.ok('Organization Aztec vous invite à rejoindre Pix');
  });

  test('should contain an open register form and closed login form', async function (assert) {
    // when
    await render(
      <template>
        <ScoSignupOrLogin @displayScoSignupForm={{true}} @toggleFormsVisibility={{toggleFormsVisibility}} />
      </template>,
    );

    // then
    assert.dom('.sco-signup-form').exists();
    assert.dom('.login-form').doesNotExist();
  });

  test('should open the login panel and close the register panel when clicking on login button', async function (assert) {
    // given
    await render(
      <template>
        <ScoSignupOrLogin @displayScoSignupForm={{false}} @toggleFormsVisibility={{toggleFormsVisibility}} />
      </template>,
    );

    // when
    await clickByLabel(t('pages.sco-signup-or-login.login-form.button'));

    // then
    assert.dom('.sco-signup-form').doesNotExist();
    assert.dom('.login-form').exists();
  });
});
