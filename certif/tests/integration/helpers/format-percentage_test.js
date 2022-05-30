import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Helper | format-percentage', function (hooks) {
  setupRenderingTest(hooks);

  test('it truncate decimal places', async function (assert) {
    this.set('value', 0.2899999);

    const screen = await renderScreen(hbs`{{format-percentage value}}`);

    assert.dom(this.element).hasText('28 %');
    assert.dom(screen.getByText('28 %')).exists();
  });

  test('it displays a percentage symbol', async function (assert) {
    this.set('value', 0.3);

    const screen = await renderScreen(hbs`{{format-percentage value}}`);

    assert.dom(screen.getByText('30 %')).exists();
  });

  test('it renders an empty string if value is null', async function (assert) {
    this.set('value', null);

    const screen = await renderScreen(hbs`{{format-percentage value}}`);

    assert.dom(screen.queryByText('%')).doesNotExist();
  });
});
