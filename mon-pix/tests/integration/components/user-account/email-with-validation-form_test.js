import { render } from '@1024pix/ember-testing-library';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | user-account | email-with-validation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when editing e-mail', function () {
    test('should display save and cancel button', async function (assert) {
      // when
      const screen = await render(hbs`<UserAccount::EmailWithValidationForm />`);

      // then
      assert.ok(screen.getByRole('button', { name: this.intl.t('common.actions.cancel') }));
      assert.ok(
        screen.getByRole('button', {
          name: this.intl.t('pages.user-account.account-update-email-with-validation.save-button'),
        }),
      );
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
        await click(screen.getByRole('button', { name: this.intl.t('common.actions.cancel') }));

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
      await _fillInputsAndValidateNewEmail({ screen, intl: this.intl, email: newEmail, password });

      // then
      sinon.assert.calledOnce(this.showVerificationCode);
      assert.ok(true);
    });

    test('should display email already exists error if response status is 400', async function (assert) {
      // given
      const emailAlreadyExist = 'email@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '400', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }] }),
      });

      const screen = await render(
        hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`,
      );

      // when
      await _fillInputsAndValidateNewEmail({ screen, intl: this.intl, email: emailAlreadyExist, password });

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.new-email-already-exist'),
        ),
      );
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
      await _fillInputsAndValidateNewEmail({ screen, intl: this.intl, email: newEmail, password });

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-password'),
        ),
      );
    });

    test('should display invalid email format error if response status is 422', async function (assert) {
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
      await _fillInputsAndValidateNewEmail({ screen, intl: this.intl, email: newEmail, password });

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-email'),
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
      await _fillInputsAndValidateNewEmail({ screen, intl: this.intl, email: newEmail, password });

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.empty-password'),
        ),
      );
    });
  });

  async function _fillInputsAndValidateNewEmail({ screen, intl, email, password }) {
    await fillIn(screen.getByRole('textbox', { name: 'Nouvelle adresse e-mail' }), email);
    await fillIn(screen.getByLabelText('Mot de passe'), password);
    await click(
      screen.getByRole('button', {
        name: intl.t('pages.user-account.account-update-email-with-validation.save-button'),
      }),
    );
  }
});
