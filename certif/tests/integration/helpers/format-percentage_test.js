import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | format-percentage', function (hooks) {
  setupRenderingTest(hooks);

  test('it truncate decimal places', async function (assert) {
    this.set('value', 0.2899999);

    await render(hbs`{{format-percentage value}}`);

    assert.dom(this.element).hasText('28 %');
  });

  test('it displays a percentage symbol', async function (assert) {
    this.set('value', 0.3);

    await render(hbs`{{format-percentage value}}`);

    assert.dom(this.element).hasText('30 %');
  });

  test('it renders an empty string if value is null', async function (assert) {
    this.set('value', null);

    await render(hbs`{{format-percentage value}}`);

    assert.dom(this.element).hasText('');
  });
});
