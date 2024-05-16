import { render } from '@1024pix/ember-testing-library';
import SafeMarkdownToHtml from 'pix-orga/components/safe-markdown-to-html';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | SafeMarkdownToHtml', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display html from markdown ', async function (assert) {
    // given
    const markdown = `<a href="https://pix.fr">monpix</a> Hello ! `;

    // when
    const screen = await render(<template><SafeMarkdownToHtml @markdown={{markdown}} /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: 'monpix' }));
    assert.ok(screen.getByText(/Hello/));
  });
});
