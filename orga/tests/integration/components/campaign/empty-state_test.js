import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::EmptyState', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the empty message', async function (assert) {
    await render(hbs`<Campaign::EmptyState @campaignCode='ABDC123' />`);

    assert.contains(this.intl.t('pages.campaign.empty-state'));
  });
});
