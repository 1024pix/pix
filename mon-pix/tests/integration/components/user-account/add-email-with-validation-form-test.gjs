import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AddEmailWithValidationForm from 'mon-pix/components/user-account/add-email-with-validation-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | user-account | add-email-with-validation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the user opens the add email form', function () {
    test('displays save and cancel button, and information message', async function (assert) {
      // when
      const screen = await render(<template><AddEmailWithValidationForm /></template>);

      // then
      assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
      assert.ok(
        screen.getByRole('button', {
          name: t('pages.user-account.account-add-or-update-email-with-validation.save-button'),
        }),
      );
      const codeReceptionInformation = t(
        'pages.user-account.account-add-or-update-email-with-validation.code-reception-information',
      );
      assert.ok(screen.getByText(codeReceptionInformation));
    });

    module('when the user cancels edition', function () {
      test('calls disableEmailEditionMode', async function (assert) {
        // given
        const disableEmailEditionMode = sinon.stub();

        const screen = await render(
          <template><AddEmailWithValidationForm @disableEmailEditionMode={{disableEmailEditionMode}} /></template>,
        );

        // when
        await click(screen.getByRole('button', { name: t('common.actions.cancel') }));

        // then
        sinon.assert.called(disableEmailEditionMode);
        assert.ok(true);
      });
    });

    module('when the user fills inputs with errors', function () {
      module('in new email input', function () {
        test('displays an invalid error message when invalid email is entered', async function (assert) {
          // given
          const invalidEmail = 'invalidEmail';
          const expectedInvalidEmailError = 'Votre adresse e-mail n’est pas valide.';

          const screen = await render(<template><AddEmailWithValidationForm /></template>);
          const emailInput = screen.getByRole('textbox', { name: 'Adresse e-mail' });

          // when
          await fillIn(emailInput, invalidEmail);

          // then
          assert.dom(screen.getByText(expectedInvalidEmailError)).exists();
        });
      });
    });
  });

  module('when the user submits new email and password', function (hooks) {
    let store;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    test('calls the show verification code method only once', async function (assert) {
      // given
      const email = 'email@example.net';
      const password = 'Password123';
      const showVerificationCode = sinon.stub();
      store.createRecord = () => ({ sendNewEmail: sinon.stub() });

      const screen = await render(
        <template><AddEmailWithValidationForm @showVerificationCode={{showVerificationCode}} /></template>,
      );

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: email, password });

      // then
      sinon.assert.calledOnce(showVerificationCode);
      assert.ok(true);
    });

    test('displays error message from server if response status is 400 or 403', async function (assert) {
      // given
      const email = 'email@example.net';
      const password = 'Password123';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '400' }] }),
      });

      const screen = await render(<template><AddEmailWithValidationForm /></template>);

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: email, password });

      // then
      assert.ok(
        screen.getByText(
          t('pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-password'),
        ),
      );
    });

    test('displays invalid or already used email error if response status is 422', async function (assert) {
      // given
      const email = 'email@example.net';
      const password = 'Password123';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '422', source: { pointer: 'attributes/email' } }] }),
      });

      const screen = await render(<template><AddEmailWithValidationForm /></template>);

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: email, password });

      // then
      assert.ok(
        screen.getByText(
          t(
            'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-or-already-used-email',
          ),
        ),
      );
    });

    test('displays empty password error if response status is 422', async function (assert) {
      // given
      const email = 'email@example.net';
      const password = 'Password123';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '422', source: { pointer: 'attributes/password' } }] }),
      });

      const screen = await render(<template><AddEmailWithValidationForm /></template>);

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: email, password });

      // then
      assert.ok(
        screen.getByText(
          t('pages.user-account.account-add-or-update-email-with-validation.fields.errors.empty-password'),
        ),
      );
    });
  });

  async function _fillInputsAndValidateNewEmail({ screen, t, email, password }) {
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), email);
    await fillIn(screen.getByLabelText('Mot de passe'), password);
    await click(
      screen.getByRole('button', {
        name: t('pages.user-account.account-add-or-update-email-with-validation.save-button'),
      }),
    );
  }
});
