import { expect } from 'chai';
import { describe, it } from 'mocha';
import { find, click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import findByLabel from '../../../helpers/find-by-label';
import { render } from '@1024pix/ember-testing-library';

describe('Integration | Component | account-recovery | update-sco-record', function () {
  setupIntlRenderingTest();

  it('should display a reset password form', async function () {
    // given
    const newEmail = 'philippe.example.net';
    const firstName = 'Philippe';
    this.set('firstName', firstName);
    this.set('email', newEmail);

    // when
    const screen = await render(
      hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`
    );

    // then
    expect(
      screen.getByRole('heading', {
        name: this.intl.t('pages.account-recovery.update-sco-record.welcome-message', { firstName }),
      })
    ).to.exist;
    expect(screen.getByText(this.intl.t('pages.account-recovery.update-sco-record.fill-password'))).to.exist;
    expect(
      screen.getByRole('textbox', { name: this.intl.t('pages.account-recovery.update-sco-record.form.email-label') })
    ).to.exist;
    expect(screen.getByLabelText(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'))).to.exist;

    const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
    expect(submitButton).to.exist;
    expect(submitButton.disabled).to.be.true;

    expect(find('input[type="checkbox"]')).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('common.cgu.cgu') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('common.cgu.data-protection-policy') })).to.exist;
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
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm @isLoading={{true}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      expect(submitButton.disabled).to.be.true;
    });

    it('should enable submission if password is valid and cgu and data protection policy are accepted', async function () {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

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

        const screen = await render(
          hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`
        );

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.update-sco-record.form.password-label'),
          invalidPassword
        );
        await triggerEvent('#password', 'focusout');

        // then
        expect(
          screen.getByText(this.intl.t('pages.account-recovery.update-sco-record.form.errors.invalid-password'))
        ).to.exist;
      });

      it('should display a required field error message on focus-out if password field is empty', async function () {
        // given
        const password = '';
        const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), password);
        await triggerEvent('#password', 'focusout');

        // then
        expect(
          screen.getByText(this.intl.t('pages.account-recovery.update-sco-record.form.errors.empty-password'))
        ).to.exist;
      });
    });
  });
});
