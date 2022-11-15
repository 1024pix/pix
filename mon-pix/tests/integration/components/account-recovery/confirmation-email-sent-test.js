import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | account-recovery/confirmation-email-sent', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a sent email confirmation message', async function (assert) {
    //given / when
    await render(hbs`<AccountRecovery::ConfirmationEmailSent />`);

    //then
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.title')));
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.send-email')));
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.check-spam')));
    assert.ok(contains(this.intl.t('pages.account-recovery.find-sco-record.send-email-confirmation.return')));
  });
});
