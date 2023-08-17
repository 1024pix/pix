import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | Campaign::EmptyState', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it displays the empty message', async function (assert) {
    await render(hbs`<Campaign::EmptyState @campaignCode='ABDC123' />`);

    assert.contains(t('pages.campaign.empty-state'));
  });
});
