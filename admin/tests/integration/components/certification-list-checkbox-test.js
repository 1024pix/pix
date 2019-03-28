import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-list-checkbox', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{certification-list-checkbox}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{certification-list-checkbox}}
    `);

    assert.dom('input[type="checkbox"]').exists();
  });
});
