import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/login-or-register', function(hooks) {

  setupIntlRenderingTest(hooks);

  let loginButton;

  hooks.beforeEach(function() {
    loginButton = this.intl.t('pages.login-or-register.login-form.button');
  });

  test('it renders', async function(assert) {
    // when
    await render(hbs`<Routes::LoginOrRegister/>`);

    // then
    assert.dom('.login-or-register').exists();
  });

  test('it display the organization name the user is invited to', async function(assert) {
    // when
    const invitationMessage = this.intl.t('pages.login-or-register.invitation');

    await render(hbs`<Routes::LoginOrRegister @organizationName='Organization Aztec'/>`);

    // then
    assert.dom('.login-or-register-panel__invitation').hasText(`${invitationMessage} Organization Aztec`);
  });

  test('it toggle the register form by default', async function(assert) {
    // when
    await render(hbs`<Routes::LoginOrRegister/>`);

    // then
    assert.dom('.register-form').exists();
  });

  test('it toggle the login form on click on login button', async function(assert) {
    // given
    await render(hbs`<Routes::LoginOrRegister/>`);

    // when
    await clickByLabel(loginButton);

    // then
    assert.dom('.login-form').exists();
  });

  test('it toggle the register form on click on register button', async function(assert) {
    // given
    const registerButtonLabel = this.intl.t('pages.login-or-register.register-form.button');

    await render(hbs`<Routes::LoginOrRegister/>`);

    // when
    await clickByLabel(loginButton);
    await clickByLabel(registerButtonLabel);

    // then
    assert.dom('.register-form').exists();
  });
});
