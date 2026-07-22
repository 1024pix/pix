import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ConfirmationEmailSent from 'mon-pix/components/account-recovery/confirmation-email-sent';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | account-recovery/confirmation-email-sent', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a sent email confirmation message', async function (assert) {
    //given / when
    const screen = await render(<template><ConfirmationEmailSent /></template>);

    //then
    assert
      .dom(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.find-sco-record.send-email-confirmation.title'),
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByText(t('pages.account-recovery.find-sco-record.send-email-confirmation.send-email'), {
          exact: false,
        }),
      )
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
