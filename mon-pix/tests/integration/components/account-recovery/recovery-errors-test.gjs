import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import RecoveryErrors from 'mon-pix/components/account-recovery/recovery-errors';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | recovery-errors', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render an account recovery error', async function (assert) {
    // given
    const firstName = 'Philippe';
    const title = t('pages.account-recovery.find-sco-record.conflict.found-you-but', { firstName });
    const message = t('pages.account-recovery.find-sco-record.conflict.warning');

    // when
    const screen = await render(<template><RecoveryErrors @title={{title}} @message={{message}} /></template>);

    // then
    assert.ok(screen.getByText(title));
    assert.ok(screen.getByText(message));
    assert.ok(screen.getByRole('link', { name: t('pages.account-recovery.support.url-text') }));
  });

  test('should display renew demand link when asked for', async function (assert) {
    // given;
    const showRenewLink = true;

    // when
    const screen = await render(<template><RecoveryErrors @showRenewLink={{showRenewLink}} /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: t('pages.account-recovery.errors.key-expired-renew-demand-link') }));
  });

  test('should display back to home link when asked for', async function (assert) {
    // given;
    const showBackToHomeButton = true;

    // when
    const screen = await render(<template><RecoveryErrors @showBackToHomeButton={{showBackToHomeButton}} /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
  });

  test('should display support link', async function (assert) {
    // given & when
    await render(<template><RecoveryErrors /></template>);

    // then
    assert.ok(find('a').href.includes(t('pages.account-recovery.support.url')));
  });
});
