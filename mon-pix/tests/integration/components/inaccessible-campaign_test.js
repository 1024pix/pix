/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | inaccessible-campaign', function() {
  setupIntlRenderingTest();

  it('should not display marianne logo when url does not have frenchDomainExtension', async function() {
    // given
    this.owner.register('service:url', Service.extend({ isFrenchDomainExtension: false }));

    // when
    await render(hbs`<InaccessibleCampaign></InaccessibleCampaign>`);

    // then
    expect(find('.campaign-landing-page__marianne-logo')).to.not.exist;
  });

  it('should display marianne logo when url does have frenchDomainExtension', async function() {
    // given
    this.owner.register('service:url', Service.extend({ isFrenchDomainExtension: true }));

    // when
    await render(hbs`<InaccessibleCampaign></InaccessibleCampaign>`);

    // then
    expect(find('.campaign-landing-page__marianne-logo')).to.exist;
  });
});
