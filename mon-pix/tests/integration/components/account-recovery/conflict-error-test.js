import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';

describe('Integration | Component | conflict-error', function() {
  setupIntlRenderingTest();

  it('should render an account recovery conflict error', async function() {
    // given
    const firstName = 'Philippe';
    const title = this.intl.t('pages.account-recovery.find-sco-record.conflict.found-you-but', { firstName });
    const errorMessage = this.intl.t('pages.account-recovery.find-sco-record.conflict.precaution');
    this.set('title', title);
    this.set('message', errorMessage);

    // when
    await render(hbs`<AccountRecovery::ConflictError @title={{this.title}} @message={{this.message}} />`);

    // then
    expect(contains(title)).to.exist;
    expect(contains(errorMessage)).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.conflict.support.url-text'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery.find-sco-record.conflict.support.recover'))).to.exist;
  });

  it('should redirect to renew account recovery demand when expired', async function() {
    // given;
    this.set('showRenewLink', true);

    // when
    await render(hbs`<AccountRecovery::ConflictError @showRenewLink={{this.showRenewLink}} />`);

    // then
    expect(contains(this.intl.t('pages.account-recovery.errors.key-expired-renew-demand-link'))).to.exist;
  });

  it('should redirect to home when user has already left sco', async function() {
    // given;
    this.set('showReturnToHomeButton', true);

    // when
    await render(hbs`<AccountRecovery::ConflictError @showReturnToHomeButton={{this.showReturnToHomeButton}} />`);

    // then
    expect(contains(this.intl.t('navigation.back-to-homepage'))).to.exist;
  });

  it('should redirect to support url on click on link', async function() {
    // given & when
    await render(hbs`<AccountRecovery::ConflictError />`);

    // then
    expect(find('a').href).to.contains(this.intl.t('pages.account-recovery.find-sco-record.conflict.support.url'));
  });
});
