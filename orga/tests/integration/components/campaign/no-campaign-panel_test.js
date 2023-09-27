import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::NoCampaignPanel', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the empty message', async function (assert) {
    const screen = await render(hbs`<Campaign::NoCampaignPanel />`);

    assert.dom(screen.getByText(this.intl.t('pages.campaigns-list.no-campaign'))).exists();
  });

  test('it displays the empty image', async function (assert) {
    await render(hbs`<Campaign::NoCampaignPanel />`);

    assert.dom('img[src="/images/empty-state.svg"]').exists();
  });
});
