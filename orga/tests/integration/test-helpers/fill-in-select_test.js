import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import fillInSelect from '../../helpers/extended-ember-test-helpers/fill-in-select';

module('Integration | Test Helper | fill-in-select', function (hooks) {
  setupRenderingTest(hooks);

  test('should fill in select with option label', async function (assert) {
    // given
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ];

    this.set('options', options);
    await render(hbs`<PixSelect @options={{this.options}} />`);

    // when
    await fillInSelect({ value: 'Option 2' });

    // then
    assert.dom('select').hasValue('opt2');
  });

  test('should fill in select with option label by associated label text', async function (assert) {
    // given
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ];

    this.set('options', options);
    await render(
      hbs`<label for="select">Label de mon select</label><PixSelect id="select" @options={{this.options}} />`
    );

    // when
    await fillInSelect({ labelText: 'Label de mon select', value: 'Option 2' });

    // then
    assert.dom('select').hasValue('opt2');
  });

  test('should fill in select with option label by select id', async function (assert) {
    // given
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ];

    this.set('options', options);
    await render(hbs`<PixSelect id="select" @options={{this.options}} />`);

    // when
    await fillInSelect({ id: 'select', value: 'Option 2' });

    // then
    assert.dom('select').hasValue('opt2');
  });
});
