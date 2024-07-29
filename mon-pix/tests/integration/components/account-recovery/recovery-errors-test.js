import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | recovery-errors', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render an account recovery error', async function (assert) {
    // given
    const firstName = 'Philippe';
    const title = this.intl.t('pages.account-recovery.find-sco-record.conflict.found-you-but', { firstName });
    const errorMessage = this.intl.t('pages.account-recovery.find-sco-record.conflict.warning');
    this.set('title', title);
    this.set('message', errorMessage);

    // when
    const screen = await render(
      hbs`<AccountRecovery::RecoveryErrors @title={{this.title}} @message={{this.message}} />`,
    );

    // then
    assert.ok(screen.getByText(title));
    assert.ok(screen.getByText(errorMessage));
    assert.ok(screen.getByRole('link', { name: this.intl.t('pages.account-recovery.support.url-text') }));
  });

  test('should display renew demand link when asked for', async function (assert) {
    // given;
    this.set('showRenewLink', true);

    // when
    const screen = await render(hbs`<AccountRecovery::RecoveryErrors @showRenewLink={{this.showRenewLink}} />`);

    // then
    assert.ok(
      screen.getByRole('link', { name: this.intl.t('pages.account-recovery.errors.key-expired-renew-demand-link') }),
    );
  });

  test('should display back to home link when asked for', async function (assert) {
    // given;
    this.set('showBackToHomeButton', true);

    // when
    const screen = await render(
      hbs`<AccountRecovery::RecoveryErrors @showBackToHomeButton={{this.showBackToHomeButton}} />`,
    );

    // then
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') }));
  });

  test('should display support link', async function (assert) {
    // given & when
    await render(hbs`<AccountRecovery::RecoveryErrors />`);

    // then
    assert.ok(find('a').href.includes(this.intl.t('pages.account-recovery.support.url')));
  });
});
