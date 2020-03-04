import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | search-input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('keyUpSpy', () => {});
  });

  test('should render component', async function(assert) {
    // when
    await render(hbs`<SearchInput @inputName="inputName" @keyUp={{this.keyUpSpy}} />`);

    // then
    assert.dom('input#inputName').exists();
  });

  test('should set a value', async function(assert) {
    // given
    const value = '70';
    this.set('value', value);

    // when
    await render(hbs`<SearchInput @value={{this.value}} @keyUp={{this.keyUpSpy}} />`);

    // then
    assert.dom('input').hasValue(value);
  });

  test('should set a placeholder', async function(assert) {
    // given
    const placeholder = 'Prénom';
    this.set('placeholder', placeholder);

    // when
    await render(hbs`<SearchInput @placeholder={{this.placeholder}} @keyUp={{this.keyUpSpy}} />`);

    // then
    assert.dom('input').hasAttribute('placeholder', placeholder);
  });
});
