import { reject, resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { fillByLabel, clickByName, render as renderScreen } from '@1024pix/ember-testing-library';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

import ENV from '../../../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Integration | Component | Auth::LoginForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  class SessionStub extends Service {}
  class StoreStub extends Service {}

  let emailInputLabel;
  let passwordInputLabel;
  let loginLabel;

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);
    this.owner.unregister('service:store');
    this.owner.register('service:store', StoreStub);

    emailInputLabel = this.intl.t('pages.login-form.email');
    loginLabel = this.intl.t('pages.login-form.login');
    passwordInputLabel = this.intl.t('pages.login-form.password');
  });

  test('it should ask for email and password', async function (assert) {
    // when
    await renderScreen(hbs`<Auth::LoginForm />`);

    // then
    assert.dom('#login-email').exists();
    assert.dom('#login-password').exists();
  });

  test('[a11y] it should display a message that all inputs are required', async function (assert) {
    // when
    const screen = await renderScreen(hbs`<Auth::LoginForm />`);

    // then
    assert.dom(screen.getByText('Tous les champs sont obligatoires.')).exists();
  });

  test('it should not display error message', async function (assert) {
    // when
    await renderScreen(hbs`<Auth::LoginForm />`);

    // then
    assert.dom('#login-form-error-message').doesNotExist();
  });

  module('When there is no invitation', function (hooks) {
    hooks.beforeEach(function () {
      SessionStub.prototype.authenticate = function (authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should call authentication service with appropriate parameters', async function (assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await renderScreen(hbs`<Auth::LoginForm @organizationInvitationId='1' @organizationInvitationCode='C0D3' />`);
      await fillByLabel(emailInputLabel, 'pix@example.net');
      await fillByLabel(passwordInputLabel, 'JeMeLoggue1024');

      // when
      await clickByName(loginLabel);

      // then
      assert.strictEqual(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.strictEqual(sessionServiceObserver.email, 'pix@example.net');
      assert.strictEqual(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.strictEqual(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  module('When there is an invitation', function (hooks) {
    hooks.beforeEach(function () {
      StoreStub.prototype.createRecord = () => {
        return EmberObject.create({
          save() {
            return resolve();
          },
        });
      };
      SessionStub.prototype.authenticate = function (authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };
    });

    test('it should be ok and call authentication service with appropriate parameters', async function (assert) {
      // given
      const sessionServiceObserver = this.owner.lookup('service:session');
      await renderScreen(
        hbs`<Auth::LoginForm @isWithInvitation='true' @organizationInvitationId='1' @organizationInvitationCode='C0D3' />`
      );
      await fillByLabel(emailInputLabel, 'pix@example.net');
      await fillByLabel(passwordInputLabel, 'JeMeLoggue1024');

      //  when
      await clickByName(loginLabel);

      // then
      assert.strictEqual(sessionServiceObserver.authenticator, 'authenticator:oauth2');
      assert.strictEqual(sessionServiceObserver.email, 'pix@example.net');
      assert.strictEqual(sessionServiceObserver.password, 'JeMeLoggue1024');
      assert.strictEqual(sessionServiceObserver.scope, 'pix-orga');
    });
  });

  test('it should display an invalid credentials message when authentication fails', async function (assert) {
    // given
    const errorResponse = {
      status: 401,
      responseJSON: {
        errors: [{ status: '401' }],
      },
    };

    SessionStub.prototype.authenticate = () => reject(errorResponse);

    const screen = await renderScreen(hbs`<Auth::LoginForm />`);
    await fillByLabel(emailInputLabel, 'pix@example.net');
    await fillByLabel(passwordInputLabel, 'Mauvais mot de passe');

    //  when
    await clickByName(loginLabel);

    // then
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
  });

  test('it displays a should change password message', async function (assert) {
    // given
    const errorResponse = {
      responseJSON: {
        errors: [{ status: '401', code: 'SHOULD_CHANGE_PASSWORD' }],
      },
    };

    SessionStub.prototype.authenticate = () => reject(errorResponse);

    const screen = await renderScreen(hbs`<Auth::LoginForm />`);
    await fillByLabel(emailInputLabel, 'pix@example.net');
    await fillByLabel(passwordInputLabel, 'Mauvais mot de passe');

    //  when
    await clickByName(loginLabel);

    // then
    const expectedErrorMessage = this.intl.t('pages.login-form.errors.should-change-password', {
      url: 'https://app.pix.localhost/mot-de-passe-oublie',
      htmlSafe: true,
    });
    assert
      .dom(
        screen.getByText((content, node) => {
          const hasText = (node) => node.innerHTML.trim() === expectedErrorMessage.string;
          const nodeHasText = hasText(node);
          const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child));
          return nodeHasText && childrenDontHaveText;
        })
      )
      .exists();
  });

  test('it should display an not linked organisation message when authentication fails', async function (assert) {
    // given
    const errorResponse = {
      status: Number(ApiErrorMessages.NOT_LINKED_ORGANIZATION.CODE),
      responseJSON: {
        errors: [{ status: '403' }],
      },
    };

    SessionStub.prototype.authenticate = () => reject(errorResponse);

    const screen = await renderScreen(hbs`<Auth::LoginForm />`);
    await fillByLabel(emailInputLabel, 'pix@example.net');
    await fillByLabel(passwordInputLabel, 'pix123');

    //  when
    await clickByName(loginLabel);

    // then
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.NOT_LINKED_ORGANIZATION.I18N_KEY))).exists();
  });

  test('it should not display context message', async function (assert) {
    assert.dom('login-form__information').doesNotExist();
  });

  module('when domain is pix.org', function () {
    test('should not display recovery link', async function (assert) {
      //given
      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return false;
        }
      }
      this.owner.register('service:url', UrlStub);

      // when
      await renderScreen(hbs`<Auth::LoginForm />`);

      // then
      assert.dom('.login-form__recover-access-link').doesNotExist();
    });
  });

  module('when domain is pix.fr', function () {
    test('should display recovery link', async function (assert) {
      //given
      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return true;
        }
      }
      this.owner.register('service:url', UrlStub);

      // when
      await renderScreen(hbs`<Auth::LoginForm />`);

      // then
      assert.dom('.login-form__recover-access-link').exists();
    });
  });

  module('when the user fills inputs with errors', function () {
    test('should display an invalid email error message when focus-out', async function (assert) {
      //given
      const invalidEmail = 'invalidEmail';
      const screen = await renderScreen(hbs`<Auth::LoginForm />`);

      // when
      await fillByLabel(emailInputLabel, invalidEmail);
      await triggerEvent('#login-email', 'focusout');

      // then
      assert.dom(screen.getByText(this.intl.t('pages.login-form.errors.invalid-email'))).exists();
    });

    test('should display an empty password error message when focus-out', async function (assert) {
      //given
      const screen = await renderScreen(hbs`<Auth::LoginForm />`);

      // when
      await fillByLabel(passwordInputLabel, '');
      await triggerEvent('#login-password', 'focusout');

      // then
      assert.dom(screen.getByText(this.intl.t('pages.login-form.errors.empty-password'))).exists();
    });
  });
});
