import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | Campaign::NoCampaignPanel', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it displays the empty message', async function (assert) {
    await render(hbs`<Campaign::NoCampaignPanel />`);

    assert.contains(t('pages.campaigns-list.no-campaign'));
  });

  test('it displays the empty image', async function (assert) {
    await render(hbs`<Campaign::NoCampaignPanel />`);

    assert.dom('img[src="/images/empty-state.svg"]').exists();
  });
});
