import { render } from '@1024pix/ember-testing-library';
import ChoiceChip from 'mon-pix/components/choice-chip';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | pix-choice-chip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('display a link', async function (assert) {
    // given & when
    const screen = await render(
      <template>
        {{! template-lint-disable no-bare-strings }}
        <ChoiceChip>Test</ChoiceChip>
      </template>,
    );

    // then
    assert.dom(screen.getByRole('link', { name: 'Test' })).exists();
  });
});
