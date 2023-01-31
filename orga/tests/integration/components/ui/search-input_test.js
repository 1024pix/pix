import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { fillByLabel } from '@1024pix/ember-testing-library';

module('Integration | Component | Ui::SearchInput', function (hooks) {
  setupRenderingTest(hooks);

  test('should render component', async function (assert) {
    // when
    await render(hbs`<Ui::SearchInput @inputName='inputName' />`);

    // then
    assert.dom('input#inputName').exists();
    assert.dom('input#inputName').hasAttribute('name', 'inputName');
  });

  test('should set a value', async function (assert) {
    // given
    const value = '70';
    this.set('value', value);

    // when
    await render(hbs`<Ui::SearchInput @value={{this.value}} />`);

    // then
    assert.dom('input').hasValue(value);
  });

  test('should set a placeholder', async function (assert) {
    // given
    const placeholder = 'Prénom';
    this.set('placeholder', placeholder);

    // when
    await render(hbs`<Ui::SearchInput @placeholder={{this.placeholder}} />`);

    // then
    assert.dom('input').hasAttribute('placeholder', placeholder);
  });

  test('should trigger search when user type a text', async function (assert) {
    // given
    const onSearch = sinon.stub();
    this.set('onSearch', onSearch);

    // when
    await render(hbs`<Ui::SearchInput @ariaLabel='search' @onSearch={{this.onSearch}} />`);
    await fillByLabel('search', 'Text to search');

    // then
    sinon.assert.called(onSearch);
    assert.dom('input').hasValue('Text to search');
  });
});
