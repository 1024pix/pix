import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';

describe('Integration | Component | account-recovery/reset-password', function() {
  setupIntlRenderingTest();

  it('should display a reset password form', async function() {
    // given
    const newEmail = 'philippe.example.net';
    const firstName = 'Philippe';
    this.set('firstName', firstName);
    this.set('email', newEmail);

    // when
    await render(hbs`<AccountRecovery::ResetPasswordForm @firstName={{this.firstName}} @email={{this.email}}/>`);

    // then
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.welcome-message', { firstName }))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.fill-password'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.email-label'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.password-label'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.login-button'))).to.exist;

  });

  context('password field', function() {

    context('when the user fill valid password', function() {

      it('should not display an error message on focus-out', async function() {
        // given
        const validPassword = 'pix123A*';
        await render(hbs `<AccountRecovery::ResetPasswordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.password-label'), validPassword);
        await triggerEvent('#password', 'focusout');

        // then
        expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.errors.invalid-password'))).to.not.exist;
      });

    });

    context('when the user fill invalid password', function() {

      it('should display an invalid format error message on focus-out', async function() {
        // given
        const newEmail = 'philippe.example.net';
        const firstName = 'Philippe';
        this.set('firstName', firstName);
        this.set('email', newEmail);
        const invalidPassword = 'invalidpassword';

        await render(hbs`<AccountRecovery::ResetPasswordForm @firstName={{this.firstName}} @email={{this.email}}/>`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.password-label'), invalidPassword);
        await triggerEvent('#password', 'focusout');

        // then
        expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.errors.invalid-password'))).to.exist;
      });

      it('should display a required field error message on focus-out if password field is empty', async function() {
        // given
        const password = '';
        await render(hbs `<AccountRecovery::ResetPasswordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.password-label'), password);
        await triggerEvent('#password', 'focusout');

        // then
        expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.errors.empty-password'))).to.exist;
      });
    });
  });
});
