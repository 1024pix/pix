import { render } from '@1024pix/ember-testing-library';
import Skiplink from 'mon-pix/components/skiplink';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Skip Link', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays supplied label and links to the correct anchor', async function (assert) {
    // given & when
    const screen = await render(<template><Skiplink @href="#anchor-link" @label="go-to-link" /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: 'go-to-link' }).hasAttribute('href', '#anchor-link'));
  });
});
