import { render } from '@1024pix/ember-testing-library';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | user-account | email-with-validation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when editing e-mail', function () {
    test('should display save and cancel button, and security information', async function (assert) {
      // when
      const screen = await render(hbs`<UserAccount::EmailWithValidationForm />`);

      // then
      assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
      assert.ok(
        screen.getByRole('button', {
          name: t('pages.user-account.account-add-or-update-email-with-validation.save-button'),
        }),
      );
      const securityInformation = t(
        'pages.user-account.account-add-or-update-email-with-validation.fields.password.security-information',
      );
      assert.ok(screen.getByText(securityInformation));
    });

    module('when the user cancel edition', function () {
      test('should call disableEmailEditionMode', async function (assert) {
        // given
        const disableEmailEditionMode = sinon.stub();
        this.set('disableEmailEditionMode', disableEmailEditionMode);

        const screen = await render(
          hbs`<UserAccount::EmailWithValidationForm @disableEmailEditionMode={{this.disableEmailEditionMode}} />`,
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
        test('should display an invalid error message when focus-out', async function (assert) {
          // given
          const invalidEmail = 'invalidEmail';
          const expectedInvalidEmailError = 'Votre adresse e-mail n’est pas valide.';

          const screen = await render(hbs`<UserAccount::EmailWithValidationForm />`);
          const emailInput = screen.getByRole('textbox', { name: 'Nouvelle adresse e-mail' });

          // when
          await fillIn(emailInput, invalidEmail);
          await triggerEvent(emailInput, 'focusout');

          // then
          assert.dom(screen.getByText(expectedInvalidEmailError)).exists();
        });

        test('should trim the new email value and not display an error for a surrounded-by-spaces valid email', async function (assert) {
          // given
          const emailWithSpaces = '   lea@example.net   ';
          const expectedInvalidEmailError = 'Votre adresse e-mail n’est pas valide.';

          const screen = await render(hbs`<UserAccount::EmailWithValidationForm />`);
          const emailInput = screen.getByRole('textbox', { name: 'Nouvelle adresse e-mail' });

          // when
          await fillIn(emailInput, emailWithSpaces);
          await triggerEvent(emailInput, 'focusout');

          // then
          assert.strictEqual(emailInput.value, emailWithSpaces.trim());
          assert.dom(screen.queryByText(expectedInvalidEmailError)).doesNotExist();
        });
      });
    });
  });

  module('when the user submits new email and password', function (hooks) {
    let store;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    test('should call the show verification code method only once', async function (assert) {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      this.set('showVerificationCode', sinon.stub());
      store.createRecord = () => ({ sendNewEmail: sinon.stub() });

      const screen = await render(
        hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`,
      );

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: newEmail, password });

      // then
      sinon.assert.calledOnce(this.showVerificationCode);
      assert.ok(true);
    });

    test('should not request a verification code when the form is not valid', async function (assert) {
      // given
      this.set('showVerificationCode', sinon.stub());
      const sendNewEmail = sinon.stub();
      store.createRecord = sinon.stub().returns({ sendNewEmail });

      const screen = await render(
        hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.user-account.account-add-or-update-email-with-validation.save-button'),
        }),
      );

      // then
      sinon.assert.notCalled(store.createRecord);
      sinon.assert.notCalled(sendNewEmail);
      sinon.assert.notCalled(this.showVerificationCode);
      assert.ok(true);
    });

    test('should display error message from server if response status is 400 or 403', async function (assert) {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '400' }] }),
      });

      const screen = await render(
        hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`,
      );

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: newEmail, password });

      // then
      assert.ok(
        screen.getByText(
          t('pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-password'),
        ),
      );
    });

    test('should display invalid or already used email error if response status is 422', async function (assert) {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '422', source: { pointer: 'attributes/email' } }] }),
      });

      const screen = await render(
        hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`,
      );

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: newEmail, password });

      // then
      assert.ok(
        screen.getByText(
          t(
            'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-or-already-used-email',
          ),
        ),
      );
    });

    test('should display empty password error if response status is 422', async function (assert) {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '422', source: { pointer: 'attributes/password' } }] }),
      });

      const screen = await render(
        hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`,
      );

      // when
      await _fillInputsAndValidateNewEmail({ screen, t, email: newEmail, password });

      // then
      assert.ok(
        screen.getByText(
          t('pages.user-account.account-add-or-update-email-with-validation.fields.errors.empty-password'),
        ),
      );
    });
  });

  async function _fillInputsAndValidateNewEmail({ screen, t, email, password }) {
    await fillIn(screen.getByRole('textbox', { name: 'Nouvelle adresse e-mail' }), email);
    await fillIn(screen.getByLabelText('Mot de passe'), password);
    await click(
      screen.getByRole('button', {
        name: t('pages.user-account.account-add-or-update-email-with-validation.save-button'),
      }),
    );
  }
});
