import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Badge Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('title', 'Badge de winner');
    this.set('message', 'Bravo ! Tu as ton badge !');
    this.set('imageUrl', '/images/background/hexa-pix.svg');
    this.set('altMessage', 'Ceci est un badge.');
  });

  test('should render the badge acquired card', async function (assert) {
    // when
    await render(
      hbs`<BadgeCard @message={{this.message}} @title={{this.title}} @imageUrl={{this.imageUrl}} @altMessage={{this.altMessage}} />`
    );

    // then
    assert.dom('.badge-card').exists();
    assert.strictEqual(find('.badge-card-text__title').textContent.trim(), 'Badge de winner');
    assert.strictEqual(find('.badge-card-text__message').textContent.trim(), 'Bravo ! Tu as ton badge !');
  });
});
