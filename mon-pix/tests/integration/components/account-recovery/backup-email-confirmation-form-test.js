import { describe, it } from 'mocha';
import { expect } from 'chai';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { contains } from '../../../helpers/contains';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../helpers/click-by-label';

describe('Integration | Component | account-recovery::backup-email-confirmation-form', function() {
  setupIntlRenderingTest();

  const firstName = 'Philippe';
  const existingEmail = 'philippe@example.net';

  context('when the user already has an email associated with his account', function() {

    it('should render recover account backup email confirmation form with the existing email', async function() {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      this.set('firstName', firstName);
      this.set('existingEmail', existingEmail);

      // when
      await render(hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @existingEmail={{this.existingEmail}} @resetErrors={{this.resetErrors}}/>`);

      // then
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.email-already-exist-for-account-message'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.email-is-valid-message'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.email-reset-message'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.email'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.ask-for-new-email-message'))).to.exist;
    });

  });

  context('when the user does not have an email associated with his account', async function() {

    it('should render recover account backup email confirmation form', async function() {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      this.set('firstName', firstName);

      // when
      await render(hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}}/>`);

      // then
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.email-is-needed-message', { firstName }))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.email-sent-to-choose-password-message'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.email'))).to.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.email-already-exist-for-account-message'))).to.not.exist;

    });

    it('should enable submission on backup email confirmation form', async function() {
      // given
      const email = 'Philipe@example.net';
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);

      const createRecordStub = sinon.stub();

      class StoreStubService extends Service {
        createRecord = createRecordStub;
      }

      this.owner.register('service:store', StoreStubService);
      const sendEmail = sinon.stub();
      sendEmail.resolves();
      this.set('sendEmail', sendEmail);

      await render(hbs`<AccountRecovery::BackupEmailConfirmationForm
      @sendEmail={{this.sendEmail}}
      @resetErrors={{this.resetErrors}}
      />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.email'), email);
      await clickByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.actions.submit'));

      // then
      sinon.assert.calledWithExactly(sendEmail, email);
    });

  });

  context('form validation', () => {

    it('should show an error when email is empty', async function() {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      const email = '';

      await render(hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}}/>`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.email'), email);
      await clickByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.actions.submit'));

      // then
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.error.empty-email'))).to.exist;

    });

    it('should show an error when email is not valid', async function() {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      const email = 'Philipe@';

      await render(hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}}/>`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.email'), email);
      await clickByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.actions.submit'));

      // then
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.error.wrong-email-format'))).to.exist;

    });

    it('should valid form when email is valid', async function() {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      const email = 'Philipe@example.net';
      await render(hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}}/>`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.email'), email);
      await clickByLabel(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.actions.submit'));

      // then
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.error.wrong-email-format'))).to.not.exist;
      expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.backup-email-confirmation.form.error.empty-email'))).to.not.exist;

    });

  });

});
