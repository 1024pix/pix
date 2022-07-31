import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';

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
    await render(hbs`<AccountRecovery::RecoveryErrors @title={{this.title}} @message={{this.message}} />`);

    // then
    assert.dom(contains(title)).exists();
    assert.dom(contains(errorMessage)).exists();
    assert.dom(contains(this.intl.t('pages.account-recovery.support.url-text'))).exists();
    assert.dom(contains(this.intl.t('pages.account-recovery.support.recover'))).exists();
  });

  test('should display renew demand link when asked for', async function (assert) {
    // given;
    this.set('showRenewLink', true);

    // when
    await render(hbs`<AccountRecovery::RecoveryErrors @showRenewLink={{this.showRenewLink}} />`);

    // then
    assert.dom(contains(this.intl.t('pages.account-recovery.errors.key-expired-renew-demand-link'))).exists();
  });

  test('should display back to home link when asked for', async function (assert) {
    // given;
    this.set('showBackToHomeButton', true);

    // when
    await render(hbs`<AccountRecovery::RecoveryErrors @showBackToHomeButton={{this.showBackToHomeButton}} />`);

    // then
    assert.dom(contains(this.intl.t('navigation.back-to-homepage'))).exists();
  });

  test('should display support link', async function (assert) {
    // given & when
    await render(hbs`<AccountRecovery::RecoveryErrors />`);

    // then
    assert.dom(find('a').href).hasText(this.intl.t('pages.account-recovery.support.url'));
  });
});
