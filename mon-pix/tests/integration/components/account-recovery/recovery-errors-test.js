import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';

describe('Integration | Component | recovery-errors', function () {
  setupIntlRenderingTest();

  it('should render an account recovery error', async function () {
    // given
    const firstName = 'Philippe';
    const title = this.intl.t('pages.account-recovery.find-sco-record.conflict.found-you-but', { firstName });
    const errorMessage = this.intl.t('pages.account-recovery.find-sco-record.conflict.warning');
    this.set('title', title);
    this.set('message', errorMessage);

    // when
    await render(hbs`<AccountRecovery::RecoveryErrors @title={{this.title}} @message={{this.message}} />`);

    // then
    expect(contains(title)).to.exist;
    expect(contains(errorMessage)).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.support.url-text'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.support.recover'))).to.exist;
  });

  it('should display renew demand link when asked for', async function () {
    // given;
    this.set('showRenewLink', true);

    // when
    await render(hbs`<AccountRecovery::RecoveryErrors @showRenewLink={{this.showRenewLink}} />`);

    // then
    expect(contains(this.intl.t('pages.account-recovery.errors.key-expired-renew-demand-link'))).to.exist;
  });

  it('should display back to home link when asked for', async function () {
    // given;
    this.set('showBackToHomeButton', true);

    // when
    await render(hbs`<AccountRecovery::RecoveryErrors @showBackToHomeButton={{this.showBackToHomeButton}} />`);

    // then
    expect(contains(this.intl.t('navigation.back-to-homepage'))).to.exist;
  });

  it('should display support link', async function () {
    // given & when
    await render(hbs`<AccountRecovery::RecoveryErrors />`);

    // then
    expect(find('a').href).to.contains(this.intl.t('pages.account-recovery.support.url'));
  });
});
