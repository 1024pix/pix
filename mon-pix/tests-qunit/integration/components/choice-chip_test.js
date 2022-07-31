import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pix-choice-chip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    //when
    await render(hbs`<ChoiceChip>Test</ChoiceChip>`);

    //then
    assert.dom(find('.pix-choice-chip')).exists();
  });
});
