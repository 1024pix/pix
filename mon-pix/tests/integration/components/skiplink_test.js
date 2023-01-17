import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Skip Link', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays supplied label and links to the correct anchor', async function (assert) {
    // given & when
    const screen = await render(hbs`<Skiplink @href="#anchor-link" @label="go-to-link" />`);

    // then
    assert.ok(screen.getByRole('link', { name: 'go-to-link' }).hasAttribute('href', '#anchor-link'));
  });
});
