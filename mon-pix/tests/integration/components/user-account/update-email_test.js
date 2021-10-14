import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../helpers/click-by-label';
import { contains } from '../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | user-account | update-email', () => {
  setupIntlRenderingTest();

  context('when editing e-mail', function () {
    it('should display save and cancel button', async function () {
      // when
      await render(hbs`<UserAccount::UpdateEmail/>`);

      // then
      expect(contains(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'))).to.exist;
      expect(contains(this.intl.t('common.actions.cancel'))).to.exist;
      expect(contains(this.intl.t('pages.user-account.account-update-email.save-button'))).to.exist;
    });

    context('when the user cancel edition', function () {
      it('should call disable Email Edition method', async function () {
        // given
        const disableEmailEditionMode = sinon.stub();
        this.set('disableEmailEditionMode', disableEmailEditionMode);

        await render(hbs`<UserAccount::UpdateEmail @disableEmailEditionMode={{this.disableEmailEditionMode}} />`);

        // when
        await clickByLabel(this.intl.t('common.actions.cancel'));

        // then
        sinon.assert.called(disableEmailEditionMode);
      });
    });

    context('when the user fills inputs with errors', function () {
      context('in new email input', function () {
        it('should display a wrong format error message when focus-out', async function () {
          // given
          const invalidEmail = 'invalidEmail';

          await render(hbs`<UserAccount::UpdateEmail />`);

          // when
          await fillInByLabel(
            this.intl.t('pages.user-account.account-update-email.fields.new-email.label'),
            invalidEmail
          );
          await triggerEvent('#newEmail', 'focusout');

          // then
          expect(
            contains(this.intl.t('pages.user-account.account-update-email.fields.errors.wrong-email-format'))
          ).to.exist;
        });
      });

      context('in new email confirmation input', function () {
        it('should display a wrong format error message when focus-out', async function () {
          // given
          const invalidEmail = 'invalidEmail';

          await render(hbs`<UserAccount::UpdateEmail />`);

          // when
          await fillInByLabel(
            this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
            invalidEmail
          );
          await triggerEvent('#newEmailConfirmation', 'focusout');

          // then
          expect(
            contains(this.intl.t('pages.user-account.account-update-email.fields.errors.wrong-email-format'))
          ).to.exist;
        });
      });

      context('when newEmail and newEmailConfirmation are different', function () {
        it('should display a mismatching error message when focus-out', async function () {
          // given
          const newEmail = 'new-email@example.net';
          const newEmailConfirmation = 'new-email-confirmation@example.net';

          await render(hbs`<UserAccount::UpdateEmail />`);

          // when
          await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
          await fillInByLabel(
            this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
            newEmailConfirmation
          );
          await triggerEvent('#newEmailConfirmation', 'focusout');

          // then
          expect(
            contains(this.intl.t('pages.user-account.account-update-email.fields.errors.mismatching-email'))
          ).to.exist;
        });
      });

      context('in password input', function () {
        it('should display an empty password error message when focus-out', async function () {
          // given
          const newEmail = 'newEmail@example.net';
          const emptyPassword = '';

          await render(hbs`<UserAccount::UpdateEmail />`);

          // when
          await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
          await fillInByLabel(
            this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
            newEmail
          );
          await fillInByLabel(
            this.intl.t('pages.user-account.account-update-email.fields.password.label'),
            emptyPassword
          );
          await triggerEvent('#password', 'focusout');

          // then
          expect(
            contains(this.intl.t('pages.user-account.account-update-email.fields.errors.empty-password'))
          ).to.exist;
        });

        it('should have the autocomplete attribute set to "new-password" in order to prevent the web browsers to autocomplete the password and email fields', async function () {
          // given
          const expectedAutocompleteValue = 'new-password';

          // when
          await render(hbs`<UserAccount::UpdateEmail />`);

          // then
          expect(find('#password').attributes.autocomplete.value).to.equal(expectedAutocompleteValue);
        });
      });

      it('should disable the confirm button if the form is not valid', async function () {
        // when
        await render(hbs`<UserAccount::UpdateEmail />`);

        // then
        expect(find('button[data-test-submit-email]')).to.have.attr('disabled');
      });
    });

    context('when the user save', function () {
      it('should call save new email method', async function () {
        // given
        const newEmail = 'newEmail@example.net';
        const password = 'password';

        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);

        await render(hbs`<UserAccount::UpdateEmail @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
        await fillInByLabel(
          this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
          newEmail
        );
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.password.label'), password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email.save-button'));

        // then
        sinon.assert.calledWith(saveNewEmail, newEmail);
      });

      it('should display wrong email format error if response status is 400', async function () {
        // given
        const emailAlreadyExist = 'email@example.net';
        const password = 'password';

        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({ errors: [{ status: '400', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS' }] });

        await render(hbs`<UserAccount::UpdateEmail @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillInByLabel(
          this.intl.t('pages.user-account.account-update-email.fields.new-email.label'),
          emailAlreadyExist
        );
        await fillInByLabel(
          this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
          emailAlreadyExist
        );
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.password.label'), password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email.save-button'));

        // then
        expect(
          contains(this.intl.t('pages.user-account.account-update-email.fields.errors.new-email-already-exist'))
        ).to.exist;
      });

      it('should display error message from server if response status is 400 or 403', async function () {
        // given
        const newEmail = 'newEmail@example.net';
        const password = 'password';

        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({ errors: [{ status: '400' }] });

        await render(hbs`<UserAccount::UpdateEmail @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
        await fillInByLabel(
          this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
          newEmail
        );
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.password.label'), password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email.save-button'));

        // then
        expect(
          contains(this.intl.t('pages.user-account.account-update-email.fields.errors.invalid-password'))
        ).to.exist;
      });

      it('should display default error message if response status is unknown', async function () {
        // given
        const newEmail = 'newEmail@example.net';
        const password = 'password';

        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({});

        await render(hbs`<UserAccount::UpdateEmail @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
        await fillInByLabel(
          this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
          newEmail
        );
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.password.label'), password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email.save-button'));

        // then
        expect(contains(this.intl.t('pages.user-account.account-update-email.fields.errors.unknown-error'))).to.exist;
      });

      it('should display wrong email format error if response status is 422', async function () {
        // given
        const newEmail = 'newEmail@example.net';
        const password = 'password';

        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({ errors: [{ status: '422', source: { pointer: 'attributes/email' } }] });

        await render(hbs`<UserAccount::UpdateEmail @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
        await fillInByLabel(
          this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
          newEmail
        );
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.password.label'), password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email.save-button'));

        // then
        expect(
          contains(this.intl.t('pages.user-account.account-update-email.fields.errors.wrong-email-format'))
        ).to.exist;
      });

      it('should display empty password error if response status is 422', async function () {
        // given
        const newEmail = 'newEmail@example.net';
        const password = 'password';

        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({ errors: [{ status: '422', source: { pointer: 'attributes/password' } }] });

        await render(hbs`<UserAccount::UpdateEmail @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.new-email.label'), newEmail);
        await fillInByLabel(
          this.intl.t('pages.user-account.account-update-email.fields.new-email-confirmation.label'),
          newEmail
        );
        await fillInByLabel(this.intl.t('pages.user-account.account-update-email.fields.password.label'), password);
        await clickByLabel(this.intl.t('pages.user-account.account-update-email.save-button'));

        // then
        expect(contains(this.intl.t('pages.user-account.account-update-email.fields.errors.empty-password'))).to.exist;
      });
    });
  });
});
