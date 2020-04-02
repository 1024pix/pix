import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pix-tooltip', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders default tooltip', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('text', 'Une explication toolpixdienne');

    await render(hbs`
      <PixTooltip>
        <p>I can be anything, go hover me to see the tooltip</p>
      </PixTooltip>
    `);

    assert.equal(this.element.textContent.trim(), 'I can be anything, go hover me to see the tooltip');
    assert.dom('pix-tooltip__content').hasText('Une explication toolpixdienne')
  });

  test('it renders tooltip at the right', async function(assert) {
    await render(hbs`
      <PixTooltip
        @text='Jaime les mangues'
        @position='right'>
        <button>Hover me!</button>
      </PixTooltip>
    `);

    assert.dom('pix-tooltip__content--right').exists();
  });
});
