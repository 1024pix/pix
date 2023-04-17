import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pix-choice-chip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('display a link', async function (assert) {
    // given & when
    const screen = await render(hbs`<ChoiceChip>Test</ChoiceChip>`);

    // then
    assert.dom(screen.getByRole('link', { name: 'Test' })).exists();
  });
});
