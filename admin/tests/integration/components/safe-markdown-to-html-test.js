import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | SafeMarkdownToHtml', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display html from markdown ', async function (assert) {
    // given
    this.set('markdown', `<a href="https://pix.fr">monpix</a> Hello ! `);

    // when
    const screen = await render(hbs`<SafeMarkdownToHtml @markdown={{this.markdown}} />`);

    // then
    assert.ok(screen.getByRole('link', { name: 'monpix' }));
    assert.ok(screen.getByText(/Hello/));
  });

  test('it should sanitize HTML tags', async function (assert) {
    // given
    this.set('markdown', `<a href="https://pix.fr">monpix</a><toto>hello</toto><script>alert("coucou")</script>"`);

    // when
    const screen = await render(hbs`<SafeMarkdownToHtml @markdown={{this.markdown}} />`);

    // then
    assert.ok(screen.getByRole('link', { name: 'monpix' }));
    assert.ok(screen.getByText(/toto/));
    assert.ok(screen.queryByText(/script/));
  });
});
