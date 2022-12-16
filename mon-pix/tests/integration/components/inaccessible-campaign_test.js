/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | inaccessible-campaign', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should not display marianne logo when url does not have frenchDomainExtension', async function (assert) {
    // given
    this.owner.register('service:url', Service.extend({ isFrenchDomainExtension: false }));

    // when
    await render(hbs`<InaccessibleCampaign></InaccessibleCampaign>`);

    // then
    assert.dom('.campaign-landing-page__marianne-logo').doesNotExist();
  });

  test('should display marianne logo when url does have frenchDomainExtension', async function (assert) {
    // given
    this.owner.register('service:url', Service.extend({ isFrenchDomainExtension: true }));

    // when
    await render(hbs`<InaccessibleCampaign></InaccessibleCampaign>`);

    // then
    assert.dom('.campaign-landing-page__marianne-logo').exists();
  });
});
