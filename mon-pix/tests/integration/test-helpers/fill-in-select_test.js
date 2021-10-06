import { describe, it } from 'mocha';
import { expect } from 'chai';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import fillInSelect from '../../helpers/fill-in-select';

describe('Integration | Test Helper | fill-in-select', function(hooks) {
  setupIntlRenderingTest(hooks);

  it('should fill in select with option label', async function() {
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
    expect(find('select').textContent, 'opt2');
  });

  it('should fill in select with option label by associated label text', async function() {
    // given
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ];

    this.set('options', options);
    await render(hbs`<label for="select">Label de mon select</label><PixSelect id="select" @options={{this.options}} />`);

    // when
    await fillInSelect({ labelText: 'Label de mon select', value: 'Option 2' });

    // then
    expect(find('select').textContent, 'opt2');
  });

  it('should fill in select with option label by select id', async function() {
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
    expect(find('select').textContent, 'opt2');
  });
});
