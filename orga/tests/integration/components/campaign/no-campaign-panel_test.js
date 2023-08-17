import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

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
