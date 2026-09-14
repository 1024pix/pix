import { render } from '@1024pix/ember-testing-library';
import { waitUntil } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Badges from 'pix-orga/components/campaign/badges';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign | Badges', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render badge images for each one', async function (assert) {
    // given
    const badges = [
      { id: 1, title: 'badge1', imageUrl: 'img1.svg', altMessage: 'alt-img1' },
      { id: 2, title: 'badge2', imageUrl: 'img2.svg', altMessage: 'alt-img2' },
    ];
    const acquiredBadges = [];
    // when
    const screen = await render(<template><Badges @badges={{badges}} @acquiredBadges={{acquiredBadges}} /></template>);
    // then
    const badgeImages = screen.getAllByRole('img');
    assert.strictEqual(badgeImages.length, 2);
    assert.strictEqual(badgeImages[0].getAttribute('src'), 'img1.svg');
    assert.strictEqual(badgeImages[0].getAttribute('alt'), 'alt-img1');

    assert.strictEqual(badgeImages[1].getAttribute('src'), 'img2.svg');
    assert.strictEqual(badgeImages[1].getAttribute('alt'), 'alt-img2');
  });

  test('should render a default image', async function (assert) {
    // given
    const badges = [{ title: 'badge1', imageUrl: 'bad_url.gif', altMessage: 'alt-img1' }];
    const acquiredBadges = [];

    // when
    const screen = await render(<template><Badges @badges={{badges}} @acquiredBadges={{acquiredBadges}} /></template>);
    const image = screen.getByRole('img');

    await waitUntil(() => {
      return image.src.endsWith('.svg');
    });

    // then
    assert.ok(image.src.endsWith('/images/badge_no_url.svg'));
  });

  test('should render unacquired in the title', async function (assert) {
    // given
    const badges = [{ title: 'badge1', imageUrl: 'img1', altMessage: 'alt-img1' }];
    const acquiredBadges = [];

    // when
    const screen = await render(<template><Badges @badges={{badges}} @acquiredBadges={{acquiredBadges}} /></template>);

    // then
    assert.ok(screen.getByText(`badge1 - ${t('pages.campaign-results.table.badge-tooltip.unacquired')}`));
  });

  test('should render acquired in the title', async function (assert) {
    // given
    const badges = [{ title: 'badge1', imageUrl: 'img1', altMessage: 'alt-img1' }];
    const acquiredBadges = [badges[0]];

    // when
    const screen = await render(<template><Badges @badges={{badges}} @acquiredBadges={{acquiredBadges}} /></template>);

    // then
    assert.ok(screen.getByText(`badge1 - ${t('pages.campaign-results.table.badge-tooltip.acquired')}`));
  });

  module('if badge acquisition is hidden', function () {
    test('should only render badge name without "unacquired"', async function (assert) {
      // given
      const badges = [{ title: 'badge1', imageUrl: 'img1', altMessage: 'alt-img1' }];
      const acquiredBadges = [];

      // when
      const screen = await render(
        <template>
          <Badges @badges={{badges}} @acquiredBadges={{acquiredBadges}} @hideBadgesAcquisition={{true}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText('badge1'));
      assert.notOk(screen.queryByText(`badge1 - ${t('pages.campaign-results.table.badge-tooltip.unacquired')}`));
    });

    test('should only render badge name without "acquired"', async function (assert) {
      // given
      const badges = [{ title: 'badge1', imageUrl: 'img1', altMessage: 'alt-img1' }];
      const acquiredBadges = [badges[0]];

      // when
      const screen = await render(
        <template>
          <Badges @badges={{badges}} @acquiredBadges={{acquiredBadges}} @hideBadgesAcquisition={{true}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText('badge1'));
      assert.notOk(screen.queryByText(`badge1 - ${t('pages.campaign-results.table.badge-tooltip.acquired')}`));
    });
  });
});
