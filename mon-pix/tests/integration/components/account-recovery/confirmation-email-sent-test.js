import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | account-recovery/confirmation-email-sent', function () {
  setupIntlRenderingTest();

  it('should display a sent email confirmation message', async function () {
    //given / when
    await render(hbs`<AccountRecovery::ConfirmationEmailSent />`);

    //then
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.title'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.send-email'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.check-spam'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.return'))).to.exist;
  });
});
