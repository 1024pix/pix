import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | toggle-button', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('onToggleSpy', () => {});
  });

  test('it displays the toggle button on', async function(assert) {
    // when
    await render(hbs`<ToggleButton @value={{true}} @onToggle={{this.onToggleSpy}} />`);

    // then
    assert.dom('.toggle-button input').isChecked();
  });

  test('it displays the toggle button off', async function(assert) {
    // when
    await render(hbs`<ToggleButton @value={{false}} @onToggle={{this.onToggleSpy}} />`);

    // then
    assert.dom('.toggle-button input').isNotChecked();
  });

  test('it should call the onToggle function with true', async function(assert) {
    // given
    this.set('onToggleSpy', onToggleSpy);

    // when
    await render(hbs`<ToggleButton @value={{false}} @onToggle={{this.onToggleSpy}} />`);
    await click('input');

    // then
    function onToggleSpy(actual) {
      assert.equal(actual.target.value, 'on');
    }
  });
});
