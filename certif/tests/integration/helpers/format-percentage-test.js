import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | format-percentage', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders correct value', async function(assert) {
    this.set('value', 0.3);

    await render(hbs`{{format-percentage value}}`);

    assert.dom(this.element).hasText('30 %');
  });

  test('it renders an empty string', async function(assert) {
    this.set('value', null);

    await render(hbs`{{format-percentage value}}`);
    
    assert.dom(this.element).hasText('');
  });
});
