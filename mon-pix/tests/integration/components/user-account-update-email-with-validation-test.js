import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render, triggerEvent } from '@ember/test-helpers';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import { clickByLabel } from '../../helpers/click-by-label';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | user-account-update-email-with-validation', () => {

  setupIntlRenderingTest();

  context('when editing e-mail', function() {

    it('should display save and cancel button', async function() {
      // when
      await render(hbs`<UserAccount::UserAccountUpdateEmailWithValidation/>`);

      // then
      expect(contains(this.intl.t('common.actions.cancel'))).to.exist;
      expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'))).to.exist;
    });

    context('when the user cancel edition', function() {
      it('should call disableEmailWithValidationEditionMode', async function() {
        // given
        const disableEmailWithValidationEditionMode = sinon.stub();
        this.set('disableEmailWithValidationEditionMode', disableEmailWithValidationEditionMode);

        await render(hbs`<UserAccount::UserAccountUpdateEmailWithValidation @disableEmailWithValidationEditionMode={{this.disableEmailWithValidationEditionMode}} />`);

        // when
        await clickByLabel(this.intl.t('common.actions.cancel'));

        // then
        sinon.assert.called(disableEmailWithValidationEditionMode);
      });
    });

    context('when the user fills inputs with errors', function() {

      context('in new email input', function() {

        it('should display an invalid error message when focus-out', async function() {
          // given
          const invalidEmail = 'invalidEmail';

          await render(hbs`<UserAccount::UserAccountUpdateEmailWithValidation />`);

          // when
          await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), invalidEmail);
          await triggerEvent('#newEmail', 'focusout');

          // then
          expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-email'))).to.exist;
        });
      });

      context('in password input', function() {

        it('should display an empty password error message when focus-out', async function() {
          // given
          const newEmail = 'newEmail@example.net';
          const emptyPassword = '';

          await render(hbs`<UserAccount::UserAccountUpdateEmailWithValidation />`);

          // when
          await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), newEmail);
          await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'), emptyPassword);

          // then
          expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.empty-password'))).to.exist;
        });
      });
    });
  });

  context('when the user submits new email and password', function() {

    it('should call the send verification code method', async function() {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      this.set('sendVerificationCode', sinon.stub());

      await render(hbs`<UserAccount::UserAccountUpdateEmailWithValidation @sendVerificationCode={{this.sendVerificationCode}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), newEmail);
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'), password);
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      sinon.assert.calledWith(this.sendVerificationCode, { newEmail, password });
    });

    it('should display email already exists error if response status is 400', async function() {
      // given
      const emailAlreadyExist = 'email@example.net';
      const password = 'password';

      this.set('sendVerificationCode', sinon.stub());
      this.sendVerificationCode.rejects({ errors: [{ status: '400', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }] });

      await render(hbs `<UserAccount::UserAccountUpdateEmailWithValidation @sendVerificationCode={{this.sendVerificationCode}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), emailAlreadyExist);
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'), password);
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.new-email-already-exist'))).to.exist;
    });

    it('should display error message from server if response status is 400 or 403', async function() {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';

      this.set('sendVerificationCode', sinon.stub());
      this.sendVerificationCode.rejects({ errors: [{ status: '400' }] });

      await render(hbs `<UserAccount::UserAccountUpdateEmailWithValidation @sendVerificationCode={{this.sendVerificationCode}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), newEmail);
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'), password);
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-password'))).to.exist;
    });

    it('should display invalid email format error if response status is 422', async function() {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';

      this.set('sendVerificationCode', sinon.stub());
      this.sendVerificationCode.rejects({ errors: [{ status: '422', source: { pointer: 'attributes/email' } }] });

      await render(hbs `<UserAccount::UserAccountUpdateEmailWithValidation @sendVerificationCode={{this.sendVerificationCode}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), newEmail);
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'), password);
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-email'))).to.exist;
    });

    it('should display empty password error if response status is 422', async function() {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';

      this.set('sendVerificationCode', sinon.stub());
      this.sendVerificationCode.rejects({ errors: [{ status: '422', source: { pointer: 'attributes/password' } }] });

      await render(hbs `<UserAccount::UserAccountUpdateEmailWithValidation @sendVerificationCode={{this.sendVerificationCode}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'), newEmail);
      await fillInByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'), password);
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.empty-password'))).to.exist;
    });
  });
});
