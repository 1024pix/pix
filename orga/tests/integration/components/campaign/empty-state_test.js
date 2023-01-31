import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | Campaign::EmptyState', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it displays the empty message', async function (assert) {
    await render(hbs`<Campaign::EmptyState @campaignCode='ABDC123' />`);

    assert.contains(t('pages.campaign.empty-state'));
  });
});
