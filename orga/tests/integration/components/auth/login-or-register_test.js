import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Auth::LoginOrRegister', function (hooks) {
  setupIntlRenderingTest(hooks);

  let loginButton;

  hooks.beforeEach(function () {
    loginButton = this.intl.t('pages.login-or-register.login-form.button');
  });
  test('it displays the organization name the user is invited to', async function (assert) {
    // when
    const invitationMessage = this.intl.t('pages.login-or-register.title', { organizationName: 'Organization Aztec' });

    await render(hbs`<Auth::LoginOrRegister @organizationName='Organization Aztec' />`);

    // then
    assert.dom('.login-or-register-panel__invitation').hasText(`${invitationMessage}`);
  });

  test('it toggles the register form by default', async function (assert) {
    // when
    await render(hbs`<Auth::LoginOrRegister />`);

    // then
    assert.dom('.register-form').exists();
  });

  test('it toggles the login form on click on login button', async function (assert) {
    // given
    await render(hbs`<Auth::LoginOrRegister />`);

    // when
    await clickByName(loginButton);

    // then
    assert.dom('.login-form').exists();
  });

  test('it toggles the register form on click on register button', async function (assert) {
    // given
    const registerButtonLabel = this.intl.t('pages.login-or-register.register-form.button');

    await render(hbs`<Auth::LoginOrRegister />`);

    // when
    await clickByName(loginButton);
    await clickByName(registerButtonLabel);

    // then
    assert.dom('.register-form').exists();
  });

  module('when domain is not .fr', function () {
    test('displays the language switcher and translate to language selected', async function (assert) {
      // given
      class CurrentDomainServiceStub extends Service {
        get isFranceDomain() {
          return false;
        }
      }
      class routerServiceStub extends Service {
        replaceWith() {
          return false;
        }
      }
      this.owner.register('service:currentDomain', CurrentDomainServiceStub);
      this.owner.register('service:router', routerServiceStub);

      // when
      const screen = await renderScreen(hbs`<Auth::LoginOrRegister @organizationName='Organization Aztec' />`);

      // then
      await click(screen.getByRole('button', { name: 'Français' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'English' }));
      assert.dom(screen.getByText('You have been invited to join the organisation Organization Aztec')).exists();
    });
  });

  module('when domain is .fr', function () {
    test('does not display the language switcher', async function (assert) {
      // given
      class CurrentDomainServiceStub extends Service {
        get isFranceDomain() {
          return true;
        }
      }
      this.owner.register('service:currentDomain', CurrentDomainServiceStub);

      // when
      const screen = await renderScreen(hbs`<Auth::LoginOrRegister @organizationName='Organization Aztec' />`);

      // then
      assert.dom(screen.getByText("Vous êtes invité(e) à rejoindre l'organisation Organization Aztec")).exists();
      assert.dom(screen.queryByRole('button', { name: 'Français' })).doesNotExist();
    });
  });
});
