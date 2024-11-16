import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setLocale, t } from 'ember-intl/test-support';
import PasswordResetDemandForm from 'mon-pix/components/authentication/password-reset-demand/password-reset-demand-form';
import { ENGLISH_INTERNATIONAL_LOCALE } from 'mon-pix/services/locale';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const I18N_KEYS = {
  mandatoryFieldsMessage: 'common.form.mandatory-all-fields',
  emailInput: 'components.authentication.password-reset-demand-form.fields.email.label',
  emailError: 'components.authentication.password-reset-demand-form.fields.email.error-message-invalid',
  resetDemandButton: 'components.authentication.password-reset-demand-form.actions.receive-reset-button',
  demandReceivedInfo: 'components.authentication.password-reset-demand-received-info.heading',
  contactLink: 'components.authentication.password-reset-demand-form.contact-us-link.link-text',
  tryAgainLink: 'components.authentication.password-reset-demand-received-info.try-again',
};

module('Integration | Component | Authentication | PasswordResetDemand | password-reset-demand-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let requestManagerService;

  hooks.beforeEach(function () {
    requestManagerService = this.owner.lookup('service:requestManager');
    sinon.stub(requestManagerService, 'request');
  });

  test('it displays all elements of component successfully', async function (assert) {
    // given
    const screen = await render(<template><PasswordResetDemandForm /></template>);

    // then
    assert.dom(screen.getByText(t(I18N_KEYS.mandatoryFieldsMessage))).exists();
    assert.dom(screen.getByLabelText(t(I18N_KEYS.emailInput))).hasAttribute('aria-required');
    assert.dom(screen.getByRole('button', { name: t(I18N_KEYS.resetDemandButton) })).exists();
    assert.dom(screen.queryByRole('heading', { name: t(I18N_KEYS.demandReceivedInfo) })).doesNotExist();

    const link = await screen.queryByRole('link', { name: t(I18N_KEYS.contactLink) });
    assert.dom(link).exists();
    assert.strictEqual(link.getAttribute('href'), 'https://pix.fr/support');
  });

  module('email input validation', function () {
    module('when the email input is valid', function () {
      test('it doesn’t display any error message', async function (assert) {
        // given
        const validEmail = 'someone@example.net';
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await fillByLabel(t(I18N_KEYS.emailInput), validEmail);

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();
      });
    });

    module('when the email input is invalid', function () {
      test('it displays an "invalid email" error message', async function (assert) {
        // given
        const invalidEmail = 'invalid email';
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await fillByLabel(t(I18N_KEYS.emailInput), invalidEmail);

        // then
        assert.dom(screen.queryByText(t(I18N_KEYS.emailError))).exists();
      });
    });
  });

  module('when user submits the password reset demand', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(window, 'fetch');
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when the password-reset-demand is successful', function () {
      test('it displays a "password reset demand received" info (without any error message)', async function (assert) {
        // given
        requestManagerService.request.resolves({ response: { ok: true, status: 201 } });

        const email = 'someone@example.net';
        const locale = ENGLISH_INTERNATIONAL_LOCALE;

        // when
        await setLocale(locale);
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        await fillByLabel(t(I18N_KEYS.emailInput), email);
        await click(screen.getByRole('button', { name: t(I18N_KEYS.resetDemandButton) }));

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();

        assert.dom(screen.queryByRole('heading', { name: t(I18N_KEYS.demandReceivedInfo) })).exists();

        const tryAgainLink = await screen.queryByRole('link', { name: t(I18N_KEYS.tryAgainLink) });
        assert.dom(tryAgainLink).exists();
        assert.strictEqual(tryAgainLink.getAttribute('href'), `/mot-de-passe-oublie?lang=${locale}`);
      });
    });

    module('when email value is missing', function () {
      test('it displays an error message on email', async function (assert) {
        // given
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await click(
          screen.getByRole('button', {
            name: t(I18N_KEYS.resetDemandButton),
          }),
        );

        // then
        assert.dom(screen.queryByText(t(I18N_KEYS.emailError))).exists();
        assert.true(window.fetch.notCalled);
      });
    });

    // TODO: This test module will need to be removed when the API doesn't leak anymore that an account doesn't exist with a "404 Not Found".
    module('when there is no corresponding user account', function () {
      test('it displays a "password reset demand received" info (without any error message to avoid email enumeration)', async function (assert) {
        // given
        requestManagerService.request.rejects({ status: 404 });

        const email = 'someone@example.net';
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await fillByLabel(t(I18N_KEYS.emailInput), email);
        await click(
          screen.getByRole('button', {
            name: t(I18N_KEYS.resetDemandButton),
          }),
        );

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();

        assert.dom(screen.queryByRole('heading', { name: t(I18N_KEYS.demandReceivedInfo) })).exists();
      });
    });

    module('when there is an unknown error', function () {
      test('it displays an "unknown error" error message', async function (assert) {
        // given
        requestManagerService.request.rejects({ status: 500 });

        const email = 'someone@example.net';
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await fillByLabel(t(I18N_KEYS.emailInput), email);
        await click(
          screen.getByRole('button', {
            name: t(I18N_KEYS.resetDemandButton),
          }),
        );

        // then
        assert.dom(screen.queryByText(t('common.api-error-messages.internal-server-error'))).exists();
      });
    });

    module('when there is an error in errors service', function () {
      test('it displays the error on the corresponding banner', async function (assert) {
        // given
        const errorKeyMessageToBeDisplayed = 'pages.reset-password.error.expired-demand';
        const errorsService = this.owner.lookup('service:errors');

        // when
        errorsService.push(errorKeyMessageToBeDisplayed);
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // then
        assert.dom(screen.getByRole('alert', { value: t(errorKeyMessageToBeDisplayed) })).exists();
      });
    });
  });
});
