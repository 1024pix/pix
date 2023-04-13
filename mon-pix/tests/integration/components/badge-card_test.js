import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Badge Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render the badge acquired card', async function (assert) {
    // given
    this.set('title', 'Badge de winner');
    this.set('message', 'Bravo ! Tu as ton badge !');
    this.set('imageUrl', '/images/background/hexa-pix.svg');
    this.set('altMessage', 'Ceci est un badge.');

    // when
    const screen = await render(
      hbs`<BadgeCard @message={{this.message}} @title={{this.title}} @imageUrl={{this.imageUrl}} @altMessage={{this.altMessage}} />`
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'Badge de winner', level: 3 })).exists();
    assert
      .dom(screen.getByRole('img', { name: 'Ceci est un badge.' }))
      .hasAttribute('src', '/images/background/hexa-pix.svg');
    assert.dom(screen.getByText('Bravo ! Tu as ton badge !')).exists();
  });
});
