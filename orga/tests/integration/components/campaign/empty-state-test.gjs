import { render } from '@1024pix/ember-testing-library';
import EmptyState from 'pix-orga/components/campaign/empty-state';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::EmptyState', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when a campaign code is provided', function () {
    test('it displays the empty message with copy button', async function (assert) {
      const screen = await render(<template><EmptyState @campaignCode="ABDC123" /></template>);

      assert.dom(screen.getByText(t('pages.campaign.empty-state-with-copy-link'))).exists();
      assert.dom(screen.getByRole('button', { name: t('pages.campaign.copy.link.default') })).exists();
    });

    module('When campaign is From combined course', function () {
      test('displays the empty message without copy button', async function (assert) {
        // when
        const screen = await render(
          <template><EmptyState @campaignCode="ACDC" @isFromCombinedCourse={{true}} /></template>,
        );

        // then
        assert.dom(screen.getByText(t('pages.campaign.empty-state'))).exists();
        assert.dom(screen.queryByRole('button', { name: t('pages.campaign.copy.link.default') })).doesNotExist();
      });
    });
  });

  module('when no campaign code is given', function () {
    test('displays the empty message without copy button', async function (assert) {
      // when
      const screen = await render(<template><EmptyState /></template>);

      // then
      assert.dom(screen.getByText(t('pages.campaign.empty-state'))).exists();
      assert.dom(screen.queryByRole('button', { name: t('pages.campaign.copy.link.default') })).doesNotExist();
    });
  });
});
