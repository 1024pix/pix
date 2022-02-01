import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, triggerEvent } from '@ember/test-helpers';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../helpers/click-by-label';
import { contains } from '../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | user-account | email-with-validation-form', () => {
  setupIntlRenderingTest();

  context('when editing e-mail', function () {
    it('should display save and cancel button', async function () {
      // when
      await render(hbs`<UserAccount::EmailWithValidationForm />`);

      // then
      expect(contains(this.intl.t('common.actions.cancel'))).to.exist;
      expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'))).to.exist;
    });

    context('when the user cancel edition', function () {
      it('should call disableEmailEditionMode', async function () {
        // given
        const disableEmailEditionMode = sinon.stub();
        this.set('disableEmailEditionMode', disableEmailEditionMode);

        await render(
          hbs`<UserAccount::EmailWithValidationForm @disableEmailEditionMode={{this.disableEmailEditionMode}} />`
        );

        // when
        await clickByLabel(this.intl.t('common.actions.cancel'));

        // then
        sinon.assert.called(disableEmailEditionMode);
      });
    });

    context('when the user fills inputs with errors', function () {
      context('in new email input', function () {
        it('should display an invalid error message when focus-out', async function () {
          // given
          const invalidEmail = 'invalidEmail';

          await render(hbs`<UserAccount::EmailWithValidationForm />`);

          // when
          await fillInByLabel(
            this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'),
            invalidEmail
          );
          await triggerEvent('#newEmail', 'focusout');

          // then
          expect(
            contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-email'))
          ).to.exist;
        });
      });
    });
  });

  context('when the user submits new email and password', function () {
    let store;

    beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    it('should call the show verification code method only once', async function () {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      this.set('showVerificationCode', sinon.stub());
      store.createRecord = () => ({ sendNewEmail: sinon.stub() });

      await render(hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`);

      // when
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'),
        newEmail
      );
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'),
        password
      );
      clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      sinon.assert.calledOnce(this.showVerificationCode);
    });

    it('should display email already exists error if response status is 400', async function () {
      // given
      const emailAlreadyExist = 'email@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '400', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }] }),
      });

      await render(hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`);

      // when
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'),
        emailAlreadyExist
      );
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'),
        password
      );
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(
        contains(
          this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.new-email-already-exist')
        )
      ).to.exist;
    });

    it('should display error message from server if response status is 400 or 403', async function () {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '400' }] }),
      });

      await render(hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`);

      // when
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'),
        newEmail
      );
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'),
        password
      );
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(
        contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-password'))
      ).to.exist;
    });

    it('should display invalid email format error if response status is 422', async function () {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '422', source: { pointer: 'attributes/email' } }] }),
      });

      await render(hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`);

      // when
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'),
        newEmail
      );
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'),
        password
      );
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(
        contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.invalid-email'))
      ).to.exist;
    });

    it('should display empty password error if response status is 422', async function () {
      // given
      const newEmail = 'newEmail@example.net';
      const password = 'password';
      store.createRecord = () => ({
        sendNewEmail: sinon.stub().throws({ errors: [{ status: '422', source: { pointer: 'attributes/password' } }] }),
      });

      await render(hbs`<UserAccount::EmailWithValidationForm @showVerificationCode={{this.showVerificationCode}} />`);

      // when
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'),
        newEmail
      );
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'),
        password
      );
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));

      // then
      expect(
        contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.empty-password'))
      ).to.exist;
    });
  });
});
