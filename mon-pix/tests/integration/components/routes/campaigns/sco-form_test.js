import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | routes/campaigns/sco-form', function () {
  setupIntlRenderingTest();

  it('should display the rgpd legal notice', async function () {
    // given & when
    const screen = await renderScreen(hbs`<Routes::Campaigns::ScoForm />`);

    // then
    expect(screen.getByText(this.intl.t('pages.join.rgpd-legal-notice'))).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('pages.join.rgpd-legal-notice-link') })).to.exist;
  });
});
