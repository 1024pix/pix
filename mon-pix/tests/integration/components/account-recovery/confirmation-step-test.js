import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { clickByLabel } from '../../../helpers/click-by-label';
import findByLabel from '../../../helpers/find-by-label';
import sinon from 'sinon';

describe('Integration | Component | confirmation-step', function () {
  setupIntlRenderingTest();

  it('should render account recovery confirmation step', async function () {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);

    // when
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
    />`);

    // then
    expect(
      contains(
        this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.good-news', { firstName: 'Philippe' })
      )
    ).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.found-account'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.contact-support'))).to.exist;
    expect(contains('Auguste'));
    expect(contains('Philippe'));
    expect(contains('Philippe.auguste2312'));
    expect(contains('Collège George-Besse, Loches'));
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'))).to.exist;
  });

  context('when user does not have a username', function () {
    it('should not display username', async function () {
      // given
      const studentInformationForAccountRecovery = EmberObject.create({
        firstName: 'Philippe',
        lastName: 'Auguste',
        email: 'philippe.auguste@example.net',
        latestOrganizationName: 'Collège George-Besse, Loches',
      });
      this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);

      // when
      await render(hbs`<AccountRecovery::ConfirmationStep
        @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      />`);

      // then
      expect(
        contains(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.fields.username'))
      ).to.not.exist;
    });
  });

  it('should be possible to cancel the account recovery process', async function () {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const cancelAccountRecovery = sinon.stub();
    this.set('cancelAccountRecovery', cancelAccountRecovery);

    // when
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @cancelAccountRecovery={{this.cancelAccountRecovery}}
    />`);
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.cancel'));

    // then
    sinon.assert.calledOnce(cancelAccountRecovery);
  });

  it('should not be possible to continue the account recovery process when have not checked to certify', async function () {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const continueAccountRecoveryBackupEmailConfirmation = sinon.stub();
    this.set('continueAccountRecoveryBackupEmailConfirmation', continueAccountRecoveryBackupEmailConfirmation);

    // when
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @continueAccountRecoveryBackupEmailConfirmation={{this.continueAccountRecoveryBackupEmailConfirmation}}
    />`);

    // then
    const confirmButton = findByLabel(
      this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm')
    );
    expect(confirmButton).to.exist;
    expect(confirmButton.disabled).to.be.true;
  });

  it('should be possible to continue the account recovery process', async function () {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const continueAccountRecoveryBackupEmailConfirmation = sinon.stub();
    this.set('continueAccountRecoveryBackupEmailConfirmation', continueAccountRecoveryBackupEmailConfirmation);

    // when
    await render(hbs`<AccountRecovery::ConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @continueAccountRecoveryBackupEmailConfirmation={{this.continueAccountRecoveryBackupEmailConfirmation}}
    />`);
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.certify-account'));
    await clickByLabel(this.intl.t('pages.account-recovery.find-sco-record.confirmation-step.buttons.confirm'));

    // then
    sinon.assert.calledOnce(continueAccountRecoveryBackupEmailConfirmation);
  });
});
