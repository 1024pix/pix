import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::EmptyState', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the empty message', async function (assert) {
    const screen = await render(hbs`<Campaign::EmptyState @campaignCode='ABDC123' />`);

    assert.dom(screen.getByText(this.intl.t('pages.campaign.empty-state-with-copy-link'))).exists();
  });
});
