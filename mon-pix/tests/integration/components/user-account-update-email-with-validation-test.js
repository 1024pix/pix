import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import {
  find,
  render,
  triggerEvent,
} from '@ember/test-helpers';
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
      expect(find('[data-test-id="user-account-update-email-with-validation__cancel-button"]')).to.exist;
      expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'))).to.exist;
    });

    context('when the user cancel edition', function() {
      it('should call disableEmailWithValidationEditionMode', async function() {
        // given
        const disableEmailWithValidationEditionMode = sinon.stub();
        this.set('disableEmailWithValidationEditionMode', disableEmailWithValidationEditionMode);

        await render(hbs`<UserAccount::UserAccountUpdateEmailWithValidation @disableEmailWithValidationEditionMode={{this.disableEmailWithValidationEditionMode}} />`);

        // when
        await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.cancel-button.aria-label'));

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
          await triggerEvent('#password', 'focusout');

          // then
          expect(contains(this.intl.t('pages.user-account.account-update-email-with-validation.fields.errors.empty-password'))).to.exist;
        });
      });
    });
  });
});
