import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | User account update email', () => {

  setupIntlRenderingTest();

  context('when editing e-mail', function() {
    let user;
    beforeEach(function() {
      // given
      user = {
        firstName: 'John',
        lastName: 'DOE',
        email: 'john.doe@example.net',
        username: 'john.doe0101',
      };
      this.set('user', user);
    });

    it('should display save and cancel button', async function() {
      // when
      await render(hbs`<UserAccountUpdateEmail/>`);

      // then
      expect(find('div[data-test-new-email]')).to.exist;
      expect(find('button[data-test-cancel-email]')).to.exist;
      expect(find('button[data-test-submit-email]')).to.exist;
    });

    context('when the user cancel edition', function() {
      it('should call disable Email Edition method', async function() {
        // given
        const disableEmailEditionMode = sinon.stub();
        this.set('disableEmailEditionMode', disableEmailEditionMode);
        await render(hbs`<UserAccountUpdateEmail @disableEmailEditionMode={{this.disableEmailEditionMode}} />`);

        // when
        await click('button[data-test-cancel-email]');

        // then
        sinon.assert.called(disableEmailEditionMode);
      });
    });

    context('when the user fills inputs with errors', function() {

      context('in new email input', function() {

        it('should display a wrong format error message when focus-out', async function() {
          // given
          const wrongEmail = 'wrongEmail';

          await render(hbs`<UserAccountUpdateEmail @user={{this.user}} />`);

          // when
          await fillIn('#newEmail', wrongEmail);
          await triggerEvent('#newEmail', 'blur');

          // then
          expect(find('#validationMessage-newEmail').textContent).to.equal(this.intl.t('pages.user-account.account-update-email.fields.errors.wrong-format'));
        });
      });

      context('in new email confirmation input', function() {

        it('should display a wrong format error message when focus-out', async function() {
          // given
          const wrongEmail = 'wrongEmail';

          await render(hbs`<UserAccountUpdateEmail @user={{this.user}} />`);

          // when
          await fillIn('#newEmailConfirmation', wrongEmail);
          await triggerEvent('#newEmailConfirmation', 'blur');

          // then
          expect(find('#validationMessage-newEmailConfirmation').textContent).to.equal(this.intl.t('pages.user-account.account-update-email.fields.errors.wrong-format'));
        });
      });

      context('when newEmail and newEmailConfirmation are different', function() {

        it('should display a mismatching error message when focus-out', async function() {
          // given
          const newEmail = 'new-email@example.net';
          const newEmailConfirmation = 'new-email-confirmation@example.net';

          await render(hbs`<UserAccountUpdateEmail @user={{this.user}} />`);

          // when
          await fillIn('#newEmail', newEmail);
          await fillIn('#newEmailConfirmation', newEmailConfirmation);
          await triggerEvent('#newEmailConfirmation', 'blur');

          // then
          expect(find('#validationMessage-newEmailConfirmation').textContent).to.equal(this.intl.t('pages.user-account.account-update-email.fields.errors.mismatching'));
        });
      });
    });

    context('when the user save', function() {

      it('should call save new email method', async function() {
        // given
        const newEmail = 'newEmail@example.net';
        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);

        await render(hbs`<UserAccountUpdateEmail @user={{this.user}} @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillIn('#newEmail', newEmail);
        await fillIn('#newEmailConfirmation', newEmail);
        await click('button[data-test-submit-email]');

        // then
        sinon.assert.calledWith(saveNewEmail, newEmail);
      });

      it('should display wrong format error if response status is 422', async function() {
        // given
        const newEmail = 'newEmail@example.net';
        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({ errors: [{ status: '422' }] });

        await render(hbs`<UserAccountUpdateEmail @user={{this.user}} @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillIn('#newEmail', newEmail);
        await fillIn('#newEmailConfirmation', newEmail);
        await click('button[data-test-submit-email]');

        // then
        expect(find('span[data-test-error-message]').textContent).to.equal(this.intl.t('pages.user-account.account-update-email.fields.errors.wrong-format'));
      });

      it('should display error message from server if response status is 400 or 403', async function() {
        // given
        const newEmail = 'newEmail@example.net';
        const expectedErrorMessage = 'An error message';
        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({ errors: [{ status: '400', detail: expectedErrorMessage }] });

        await render(hbs`<UserAccountUpdateEmail @user={{this.user}} @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillIn('#newEmail', newEmail);
        await fillIn('#newEmailConfirmation', newEmail);
        await click('button[data-test-submit-email]');

        // then
        expect(find('span[data-test-error-message]').textContent).to.equal(expectedErrorMessage);
      });

      it('should display default error message if response status is unknown', async function() {
        // given
        const newEmail = 'newEmail@example.net';
        const saveNewEmail = sinon.stub();
        this.set('saveNewEmail', saveNewEmail);
        saveNewEmail.rejects({});

        await render(hbs`<UserAccountUpdateEmail @user={{this.user}} @saveNewEmail={{this.saveNewEmail}} />`);

        // when
        await fillIn('#newEmail', newEmail);
        await fillIn('#newEmailConfirmation', newEmail);
        await click('button[data-test-submit-email]');

        // then
        expect(find('span[data-test-error-message]').textContent).to.equal(this.intl.t('pages.user-account.account-update-email.fields.errors.unknown'));
      });
    });
  });
});
