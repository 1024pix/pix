import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';

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
    const screen = await render(
      hbs`<AccountRecovery::RecoveryErrors @title={{this.title}} @message={{this.message}} />`
    );

    // then
    expect(screen.getByText(title)).to.exist;
    expect(screen.getByText(errorMessage)).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('pages.account-recovery.support.url-text') })).to.exist;
  });

  it('should display renew demand link when asked for', async function () {
    // given;
    this.set('showRenewLink', true);

    // when
    const screen = await render(hbs`<AccountRecovery::RecoveryErrors @showRenewLink={{this.showRenewLink}} />`);

    // then
    expect(
      screen.getByRole('link', { name: this.intl.t('pages.account-recovery.errors.key-expired-renew-demand-link') })
    ).to.exist;
  });

  it('should display back to home link when asked for', async function () {
    // given;
    this.set('showBackToHomeButton', true);

    // when
    const screen = await render(
      hbs`<AccountRecovery::RecoveryErrors @showBackToHomeButton={{this.showBackToHomeButton}} />`
    );

    // then
    expect(screen.getByRole('link', { name: this.intl.t('navigation.back-to-homepage') })).to.exist;
  });

  it('should display support link', async function () {
    // given & when
    await render(hbs`<AccountRecovery::RecoveryErrors />`);

    // then
    expect(find('a').href).to.contains(this.intl.t('pages.account-recovery.support.url'));
  });
});
