import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | account-recovery/confirmation-email-sent', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a sent email confirmation message', async function (assert) {
    //given / when
    const screen = await render(hbs`<AccountRecovery::ConfirmationEmailSent />`);

    //then
    assert
      .dom(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.find-sco-record.send-email-confirmation.title'),
        }),
      )
      .exists();
    assert
      .dom(screen.getByText(t('pages.account-recovery.find-sco-record.send-email-confirmation.send-email')))
      .exists();
    assert
      .dom(screen.getByText(t('pages.account-recovery.find-sco-record.send-email-confirmation.check-spam')))
      .exists();
    assert
      .dom(
        screen.getByRole('link', {
          name: t('pages.account-recovery.find-sco-record.send-email-confirmation.return'),
        }),
      )
      .exists();
  });
});
