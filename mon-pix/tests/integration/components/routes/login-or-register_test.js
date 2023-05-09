import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Routes | routes/login-or-register', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.set('toggleFormsVisibility', '');
  });

  test('should display the organization name the user is invited to', async function (assert) {
    // when
    const screen = await render(
      hbs`<Routes::LoginOrRegister @organizationName="Organization Aztec" @toggleFormsVisibility=toggleFormsVisibility/>`
    );

    // then
    assert.ok(screen.getByText('Organization Aztec vous invite à rejoindre Pix'));
  });

  test('should contain an open register form and closed login form', async function (assert) {
    // when
    const screen = await render(
      hbs`<Routes::LoginOrRegister @displayRegisterForm={{true}} @toggleFormsVisibility=toggleFormsVisibility/>`
    );

    // then
    assert.dom(screen.getByRole('textbox', { name: 'obligatoire Prénom' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'obligatoire Nom' })).exists();
    assert.dom(screen.getByRole('button', { name: "Je m'inscris" })).exists();

    assert.dom(screen.queryByRole('textbox', { name: 'Adresse e-mail ou identifiant' })).doesNotExist();
  });

  test('should open the login panel and close the register panel when clicking on login button', async function (assert) {
    // given
    const screen = await render(
      hbs`<Routes::LoginOrRegister @displayRegisterForm={{false}} @toggleFormsVisibility=toggleFormsVisibility/>`
    );

    // when
    await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Se connecter' })).exists();

    assert.dom(screen.queryByRole('textbox', { name: 'obligatoire Prénom' })).doesNotExist();
  });
});
