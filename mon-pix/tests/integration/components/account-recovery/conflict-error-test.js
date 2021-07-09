import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';

describe('Integration | Component | conflict-error', function() {
  setupIntlRenderingTest();

  it('should render a account recovery conflict error', async function() {
    // given
    const firstName = 'Philippe';
    this.set('firstName', firstName);

    // when
    await render(hbs`<AccountRecovery::ConflictError @firstName={{this.firstName}} />`);

    // then
    const expectedErrorMessage = this.intl.t('pages.account-recovery-after-leaving-sco.conflict.found-you-but', { firstName });
    expect(contains(expectedErrorMessage)).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.conflict.precaution'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.conflict.support.url-text'))).to.exist;
    expect(contains(this.intl.t('pages.account-recovery-after-leaving-sco.conflict.support.recover'))).to.exist;
  });

  it('should redirect to support url on click on link', async function() {
    // given
    const firstName = 'Philippe';
    this.set('firstName', firstName);

    // when
    await render(hbs`<AccountRecovery::ConflictError @firstName={{this.firstName}} />`);

    // then
    expect(find('a').href).to.contains(this.intl.t('pages.account-recovery-after-leaving-sco.conflict.support.url'));
  });
});
