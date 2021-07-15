import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | account-recovery/reset-password', function() {
  setupIntlRenderingTest();

  it('should display a reset password form', async function() {
    // given
    const firstName = 'Philippe';
    this.set('firstName', firstName);

    // when
    await render(hbs`<AccountRecovery::ResetPasswordForm @firstName={{this.firstName}}/>`);

    // then
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.welcome-message', { firstName }))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.fill-password'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.email-label'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.password-label'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.form.login-button'))).to.exist;

  });
});
