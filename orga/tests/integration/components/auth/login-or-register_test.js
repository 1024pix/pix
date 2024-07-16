import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Auth::LoginOrRegister', function (hooks) {
  setupIntlRenderingTest(hooks);

  let loginButton;

  hooks.beforeEach(function () {
    loginButton = t('pages.login-or-register.login-form.button');
  });
  test('displays the organization name the user is invited to', async function (assert) {
    // when
    const invitationMessage = t('pages.login-or-register.title', { organizationName: 'Organization Aztec' });

    await render(hbs`<Auth::LoginOrRegister @organizationName='Organization Aztec' />`);

    // then
    assert.dom('.login-or-register-panel__invitation').hasText(`${invitationMessage}`);
  });

  test('toggles the register form by default', async function (assert) {
    // when
    await render(hbs`<Auth::LoginOrRegister />`);

    // then
    assert.dom('.register-form').exists();
  });

  test('toggles the login form on click on login button', async function (assert) {
    // given
    await render(hbs`<Auth::LoginOrRegister />`);

    // when
    await clickByName(loginButton);

    // then
    assert.dom('.login-form').exists();
  });

  test('toggles the register form on click on register button', async function (assert) {
    // given
    const registerButtonLabel = t('pages.login-or-register.register-form.button');

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

      this.owner.register('service:currentDomain', CurrentDomainServiceStub);
      const routerService = this.owner.lookup('service:router');

      sinon.stub(routerService, 'replaceWith').returns(false);

      // when
      const screen = await render(hbs`<Auth::LoginOrRegister @organizationName='Organization Aztec' />`);

      // then
      await click(screen.getByRole('button', { name: t('pages.login.choose-language-aria-label') }));
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
      const screen = await render(hbs`<Auth::LoginOrRegister @organizationName='Organization Aztec' />`);

      // then
      assert.dom(screen.getByText("Vous êtes invité(e) à rejoindre l'organisation Organization Aztec")).exists();
      assert.dom(screen.queryByRole('button', { name: t('pages.login.choose-language-aria-label') })).doesNotExist();
    });
  });
});
