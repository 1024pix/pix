import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setLocale, t } from 'ember-intl/test-support';
import PasswordResetDemandForm from 'mon-pix/components/authentication/password-reset-demand/password-reset-demand-form';
import { ENGLISH_INTERNATIONAL_LOCALE } from 'mon-pix/services/locale';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication | PasswordResetDemand | password-reset-demand-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays a contact us link', async function (assert) {
    // given
    const screen = await render(<template><PasswordResetDemandForm /></template>);

    // then
    const link = await screen.queryByRole('link', {
      name: t('components.authentication.password-reset-demand-form.contact-us-link.link-text'),
    });
    assert.dom(link).exists();
    assert.strictEqual(link.getAttribute('href'), 'https://pix.fr/support');
  });

  test('it doesn’t display a "password reset demand received" info', async function (assert) {
    // given
    const screen = await render(<template><PasswordResetDemandForm /></template>);

    // then
    assert
      .dom(
        screen.queryByRole('heading', {
          name: t('components.authentication.password-reset-demand-received-info.heading'),
        }),
      )
      .doesNotExist();
  });

  module('email input validation', function () {
    module('when the email input is valid', function () {
      test('it doesn’t display any error message', async function (assert) {
        // given
        const validEmail = 'someone@example.net';
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await fillByLabel(t('components.authentication.password-reset-demand-form.fields.email.label'), validEmail);

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
        await fillByLabel(t('components.authentication.password-reset-demand-form.fields.email.label'), invalidEmail);

        // then
        assert
          .dom(
            screen.queryByText(
              t('components.authentication.password-reset-demand-form.fields.email.error-message-invalid'),
            ),
          )
          .exists();
      });
    });
  });

  module('password-reset-demand sending', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(window, 'fetch');
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when the password-reset-demand is successful', function () {
      test('it displays a "password reset demand received" info (without any error message)', async function (assert) {
        // given
        window.fetch.resolves(
          fetchMock({
            status: 201,
          }),
        );

        const email = 'someone@example.net';
        const locale = ENGLISH_INTERNATIONAL_LOCALE;

        // when
        await setLocale(locale);
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        await fillByLabel(t('components.authentication.password-reset-demand-form.fields.email.label'), email);
        await click(
          screen.getByRole('button', {
            name: t('components.authentication.password-reset-demand-form.actions.receive-reset-button'),
          }),
        );

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();

        assert
          .dom(
            screen.queryByRole('heading', {
              name: t('components.authentication.password-reset-demand-received-info.heading'),
            }),
          )
          .exists();

        const tryAgainLink = await screen.queryByRole('link', {
          name: t('components.authentication.password-reset-demand-received-info.try-again'),
        });
        assert.dom(tryAgainLink).exists();
        assert.strictEqual(tryAgainLink.getAttribute('href'), `/mot-de-passe-oublie?lang=${locale}`);
      });
    });

    // TODO: This test module will need to be removed when the API doesn't leak anymore that an account doesn't exist with a "404 Not Found".
    module('when there is no corresponding user account', function () {
      test('it displays a "password reset demand received" info (without any error message to avoid email enumeration)', async function (assert) {
        // given
        window.fetch.resolves(
          fetchMock({
            status: 404,
            body: {
              errors: [{ title: 'Not Found' }],
            },
          }),
        );

        const email = 'someone@example.net';
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await fillByLabel(t('components.authentication.password-reset-demand-form.fields.email.label'), email);
        await click(
          screen.getByRole('button', {
            name: t('components.authentication.password-reset-demand-form.actions.receive-reset-button'),
          }),
        );

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();

        assert
          .dom(
            screen.queryByRole('heading', {
              name: t('components.authentication.password-reset-demand-received-info.heading'),
            }),
          )
          .exists();
      });
    });

    module('when there is an unknown error', function () {
      test('it displays an "unknown error" error message', async function (assert) {
        // given
        window.fetch.resolves(
          fetchMock({
            status: 500,
          }),
        );

        const email = 'someone@example.net';
        const screen = await render(<template><PasswordResetDemandForm /></template>);

        // when
        await fillByLabel(t('components.authentication.password-reset-demand-form.fields.email.label'), email);
        await click(
          screen.getByRole('button', {
            name: t('components.authentication.password-reset-demand-form.actions.receive-reset-button'),
          }),
        );

        // then
        // The following doesn’t work because of a PixUi span inside the role element
        //assert
        //  .dom(screen.queryByRole('alert', { name: t('common.api-error-messages.internal-server-error') }))
        //  .exists();
        assert.dom(screen.queryByText(t('common.api-error-messages.internal-server-error'))).exists();
      });
    });
  });
});

function fetchMock({ body, status }) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json',
    },
  });
}
