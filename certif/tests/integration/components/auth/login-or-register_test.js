import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Auth::LoginOrRegister', function (hooks) {
  setupIntlRenderingTest(hooks);

  let loginButton;

  hooks.beforeEach(function () {
    loginButton = this.intl.t('pages.login-or-register.login-form.button');
  });

  test('it should display login-or-register form', async function (assert) {
    // when
    const screen = await render(hbs`<Auth::LoginOrRegister/>`);

    // then
    assert.dom(screen.getByRole('img', { name: 'Pix Certif' })).exists();
    assert
      .dom(screen.getByRole('heading', { name: this.intl.t('pages.login-or-register.register-form.title') }))
      .exists();
    assert.dom(screen.getByRole('heading', { name: this.intl.t('pages.login-or-register.login-form.title') })).exists();
    assert.dom(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') })).exists();
  });

  test('it should displays the certification center name the user is invited to', async function (assert) {
    // when
    const invitationMessage = this.intl.t('pages.login-or-register.title', {
      certificationCenterName: 'Centre de Certif',
    });

    const screen = await render(hbs`<Auth::LoginOrRegister @certificationCenterName='Centre de Certif'/>`);

    // then
    assert.dom(screen.getByText(invitationMessage)).exists();
  });

  test('it toggle the register form by default', async function (assert) {
    // given
    const registerButton = this.intl.t('pages.login-or-register.register-form.actions.login');
    const firstNameInputLabelFromRegisterForm = this.intl.t('common.forms.common-labels.firstname.label');

    // when
    const screen = await render(hbs`<Auth::LoginOrRegister/>`);

    // then
    assert.dom(screen.getByRole('textbox', { name: firstNameInputLabelFromRegisterForm })).exists();
    assert.dom(screen.getByRole('button', { name: loginButton })).exists();
    assert.dom(screen.queryByRole('button', { name: registerButton })).doesNotExist();
  });

  test('it toggle the login form on click on login button', async function (assert) {
    // given
    const emailInputLabelFromLoginForm = this.intl.t('common.forms.login-labels.email.label');
    const screen = await render(hbs`<Auth::LoginOrRegister/>`);

    // when
    await clickByName(loginButton);

    // then
    assert.dom(screen.getByRole('textbox', { name: emailInputLabelFromLoginForm })).exists();
  });

  test('it toggle the register form on click on register button', async function (assert) {
    // given
    const emailInputLabelFromRegisterForm = this.intl.t('common.forms.login-labels.email.label');
    const registerButtonLabel = this.intl.t('pages.login-or-register.register-form.actions.login');

    const screen = await render(hbs`<Auth::LoginOrRegister/>`);

    // when
    await clickByName(loginButton);
    await clickByName(registerButtonLabel);

    // then
    assert.dom(screen.getByRole('textbox', { name: emailInputLabelFromRegisterForm })).exists();
  });
});
