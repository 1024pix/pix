import { expect } from 'chai';
import { describe, it } from 'mocha';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../helpers/click-by-label';
import findByLabel from '../../../helpers/find-by-label';

describe('Integration | Component | account-recovery | update-sco-record', function () {
  setupIntlRenderingTest();

  it('should display a reset password form', async function () {
    // given
    const newEmail = 'philippe.example.net';
    const firstName = 'Philippe';
    this.set('firstName', firstName);
    this.set('email', newEmail);

    // when
    await render(hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`);

    // then
    expect(contains(this.intl.t('pages.account-recovery.update-sco-record.welcome-message', { firstName }))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.update-sco-record.fill-password'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.update-sco-record.form.email-label'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'))).to.exist;
    const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
    expect(submitButton).to.exist;
    expect(submitButton.disabled).to.be.true;
    expect(contains('philippe.example.net'));

    expect(find('input[type="checkbox"]')).to.exist;
    expect(contains(this.intl.t('pages.sign-up.fields.cgu.accept'))).to.exist;
    expect(contains(this.intl.t('pages.sign-up.fields.cgu.cgu'))).to.exist;
    expect(contains(this.intl.t('pages.sign-up.fields.cgu.and'))).to.exist;
    expect(contains(this.intl.t('pages.sign-up.fields.cgu.data-protection-policy'))).to.exist;
  });

  context('Form submission', function () {
    it('should disable submission if password is not valid', async function () {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pass');

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      expect(submitButton.disabled).to.be.true;
    });

    it('should disable submission if password is valid and cgu and data protection policy are not accepted', async function () {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      expect(submitButton.disabled).to.be.true;
    });

    it('should disable submission on form when is loading', async function () {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm @isLoading={{true}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await clickByLabel(this.intl.t('pages.sign-up.fields.cgu.accept'));

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      expect(submitButton.disabled).to.be.true;
    });

    it('should enable submission if password is valid and cgu and data protection policy are accepted', async function () {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await clickByLabel(this.intl.t('pages.sign-up.fields.cgu.accept'));

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      expect(submitButton.disabled).to.be.false;
    });
  });

  context('Error messages', function () {
    context('when the user enters a valid password', function () {
      it('should not display an error message on focus-out', async function () {
        // given
        const validPassword = 'pix123A*';
        await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), validPassword);
        await triggerEvent('#password', 'focusout');

        // then
        expect(
          contains(this.intl.t('pages.account-recovery.update-sco-record.form.errors.invalid-password'))
        ).to.not.exist;
      });
    });

    context('when the user enters an invalid password', function () {
      it('should display an invalid format error message on focus-out', async function () {
        // given
        const newEmail = 'philippe.example.net';
        const firstName = 'Philippe';
        this.set('firstName', firstName);
        this.set('email', newEmail);
        const invalidPassword = 'invalidpassword';

        await render(hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`);

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.update-sco-record.form.password-label'),
          invalidPassword
        );
        await triggerEvent('#password', 'focusout');

        // then
        expect(contains(this.intl.t('pages.account-recovery.update-sco-record.form.errors.invalid-password'))).to.exist;
      });

      it('should display a required field error message on focus-out if password field is empty', async function () {
        // given
        const password = '';
        await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), password);
        await triggerEvent('#password', 'focusout');

        // then
        expect(contains(this.intl.t('pages.account-recovery.update-sco-record.form.errors.empty-password'))).to.exist;
      });
    });
  });
});
