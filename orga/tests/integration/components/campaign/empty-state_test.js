import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::EmptyState', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when a campaign code is provided', function () {
    test('it displays the empty message with copy button', async function (assert) {
      const screen = await render(hbs`<Campaign::EmptyState @campaignCode='ABDC123' />`);

      assert.dom(screen.getByText(this.intl.t('pages.campaign.empty-state-with-copy-link'))).exists();
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.campaign.copy.link.default') })).exists();
    });
  });

  module('when no campaign code is given', function () {
    test('displays the empty message without copy button', async function (assert) {
      // when
      const screen = await render(hbs`<Campaign::EmptyState />`);

      // then
      assert.dom(screen.getByText(this.intl.t('pages.campaign.empty-state'))).exists();
      assert
        .dom(screen.queryByRole('button', { name: this.intl.t('pages.campaign.copy.link.default') }))
        .doesNotExist();
    });
  });
});
