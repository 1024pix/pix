import { render } from '@1024pix/ember-testing-library';
import CopyableId from 'pix-admin/components/ui/copyable-id';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ui/copyable-id', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the given value', async function (assert) {
    // when
    const screen = await render(<template><CopyableId @value="123" @copyButtonId="copy-test-id" /></template>);

    // then
    assert.dom(screen.getByText((_, element) => element.textContent === 'ID : 123')).exists();
  });

  test('it renders a copy button for the given value', async function (assert) {
    // when
    const screen = await render(<template><CopyableId @value="123" @copyButtonId="copy-test-id" /></template>);

    // then
    assert.dom(screen.getByRole('button')).exists();
  });
});
