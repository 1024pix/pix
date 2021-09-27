import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Badges', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render badge images for each one', async function (assert) {
    // given
    this.badges = [
      { title: 'badge1', imageUrl: 'img1', altMessage: 'alt-img1' },
      { title: 'badge2', imageUrl: 'img2', altMessage: 'alt-img2' },
    ];

    // when
    await render(hbs`<Campaign::Badges @badges={{this.badges}} />`);

    // then
    const badgeImages = this.element.querySelectorAll('img');
    assert.equal(badgeImages.length, 2);
    assert.equal(badgeImages[0].getAttribute('src'), 'img1');
    assert.equal(badgeImages[0].getAttribute('alt'), 'alt-img1');
  });

  test('should render the title', async function (assert) {
    // given
    this.badges = [{ title: 'badge1', imageUrl: 'img1', altMessage: 'alt-img1' }];

    // when
    await render(hbs`<Campaign::Badges @badges={{this.badges}} />`);

    // then
    assert.contains('badge1');
  });
});
