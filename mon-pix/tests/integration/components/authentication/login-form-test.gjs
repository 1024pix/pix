import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import LoginForm from 'mon-pix/components/authentication/login-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const I18N_KEYS = {
  loginInput: 'pages.sign-in.fields.login.label',
  loginError: 'components.authentication.login-form.fields.login.error',
  passwordInput: 'pages.sign-in.fields.password.label',
  passwordError: 'components.authentication.login-form.fields.password.error',
  submitButton: 'pages.sign-in.actions.submit',
  forgottenPasswordLink: 'pages.sign-in.forgotten-password',
};

module('Integration | Component | Authentication | LoginForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;
  let storeService;
  let routerService;
  let sessionService;

  hooks.beforeEach(async function () {
    storeService = this.owner.lookup('service:store');
    routerService = this.owner.lookup('service:router');
    sessionService = this.owner.lookup('service:session');
    sinon.stub(sessionService, 'authenticateUser');

    screen = await render(<template><LoginForm /></template>);
  });

  test('it displays all elements of component successfully', async function (assert) {
    // then
    assert.dom(screen.getByText(t('common.form.mandatory-all-fields'))).exists();
    assert.dom(screen.getByRole('textbox', { name: t(I18N_KEYS.loginInput) })).hasAttribute('aria-required');
    assert.dom(screen.getByLabelText(t(I18N_KEYS.passwordInput))).hasAttribute('aria-required');
    assert.dom(screen.getByRole('button', { name: t(I18N_KEYS.submitButton) })).exists();
    assert
      .dom(screen.getByRole('link', { name: t(I18N_KEYS.forgottenPasswordLink) }))
      .hasAttribute('href', '/mot-de-passe-oublie');
  });

  test('it logs in with valid credentials', async function (assert) {
    //given
    sessionService.authenticateUser.resolves();
    await fillByLabel(t(I18N_KEYS.loginInput), ' pix@example.net ');
    await fillByLabel(t(I18N_KEYS.passwordInput), 'JeMeLoggue1024');

    // when
    await clickByName(t(I18N_KEYS.submitButton));

    // then
    assert.ok(sessionService.authenticateUser.calledWith('pix@example.net', 'JeMeLoggue1024'));
  });

  module('when user submits without filling the form', function () {
    test('it displays an error messages on inputs', async function (assert) {
      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      assert.dom(screen.getByText(t(I18N_KEYS.loginError))).exists();
      assert.dom(screen.getByText(t(I18N_KEYS.passwordError))).exists();
      sinon.assert.notCalled(sessionService.authenticateUser);
    });
  });

  module('When there are spaces in email', function () {
    test('it logs in with email trimmed', async function (assert) {
      // given
      sessionService.authenticateUser.resolves();
      await fillByLabel(t(I18N_KEYS.loginInput), ' pix@example.net ');
      await fillByLabel(t(I18N_KEYS.passwordInput), 'JeMeLoggue1024');

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      assert.ok(sessionService.authenticateUser.calledWith('pix@example.net', 'JeMeLoggue1024'));
    });
  });

  module('When a business error occurred', function (hooks) {
    hooks.beforeEach(async function () {
      await fillByLabel(t(I18N_KEYS.loginInput), 'pix@example.net');
      await fillByLabel(t(I18N_KEYS.passwordInput), 'JeMeLoggue1024');
    });

    test('it displays error message for invalid local', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(
        _buildApiReponseError({ errorCode: 'INVALID_LOCALE_FORMAT', meta: { locale: 'foo' } }),
      );

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('pages.sign-up.errors.invalid-locale-format', { invalidLocale: 'foo' });
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for local not supported', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(
        _buildApiReponseError({ errorCode: 'LOCALE_NOT_SUPPORTED', meta: { locale: 'foo' } }),
      );

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('pages.sign-up.errors.locale-not-supported', { localeNotSupported: 'foo' });
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for a user with a temporary password', async function (assert) {
      // given
      sinon.stub(storeService, 'createRecord');
      sinon.stub(routerService, 'replaceWith');
      const passwordResetToken = 'reset-token';
      sessionService.authenticateUser.rejects(
        _buildApiReponseError({ errorCode: 'SHOULD_CHANGE_PASSWORD', meta: passwordResetToken }),
      );

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      assert.ok(storeService.createRecord.calledWith('reset-expired-password-demand', { passwordResetToken }));
      assert.ok(routerService.replaceWith.calledWith('update-expired-password'));
    });

    test('it displays error message for a user with a temporary blocked account', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ errorCode: 'USER_IS_TEMPORARY_BLOCKED' }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = 'Vous avez effectué trop de tentatives de connexion.';
      assert.dom(screen.getByText(errorMessage, { exact: false })).exists();

      const errorMessageLink = screen.getByRole('link', { name: 'mot de passe oublié' });
      assert.dom(errorMessageLink).hasAttribute('href', '/mot-de-passe-oublie');
    });

    test('it displays error message for a user with a blocked account', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ errorCode: 'USER_IS_BLOCKED' }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = 'Votre compte est bloqué car vous avez effectué trop de tentatives de connexion.';
      assert.dom(screen.getByText(errorMessage, { exact: false })).exists();

      const errorMessageLink = screen.getByRole('link', { name: 'contactez-nous' });
      assert.dom(errorMessageLink).hasAttribute('href', 'https://support.pix.org/support/tickets/new');
    });
  });

  module('When a http error occurred', function (hooks) {
    hooks.beforeEach(async function () {
      await fillByLabel(t(I18N_KEYS.loginInput), 'pix@example.net');
      await fillByLabel(t(I18N_KEYS.passwordInput), 'JeMeLoggue1024');
    });

    test('it displays error message for 400 HTTP status code', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 400 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('common.api-error-messages.bad-request-error');
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for 401 HTTP status code', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 401 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('common.api-error-messages.login-unauthorized-error');
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for 422 HTTP status code', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 422 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('common.api-error-messages.bad-request-error');
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for 504 HTTP status code', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 504 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = t('common.api-error-messages.gateway-timeout-error');
      assert.dom(screen.getByText(errorMessage)).exists();
    });

    test('it displays error message for other HTTP status code', async function (assert) {
      // given
      sessionService.authenticateUser.rejects(_buildApiReponseError({ status: 500 }));

      // when
      await clickByName(t(I18N_KEYS.submitButton));

      // then
      const errorMessage = 'Impossible de se connecter. Veuillez réessayer dans quelques instants.';
      assert.dom(screen.getByText(errorMessage, { exact: false })).exists();

      const errorMessageLink = screen.getByRole('link', { name: 'merci de nous contacter' });
      assert.dom(errorMessageLink).hasAttribute('href', 'https://pix.fr/support');
    });
  });
});

function _buildApiReponseError({ status = 400, errorCode, meta }) {
  return { status, responseJSON: { errors: [{ code: errorCode, meta }] } };
}
