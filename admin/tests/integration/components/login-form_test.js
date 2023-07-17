import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | login-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should displays a google button', async function (assert) {
    // when
    const screen = await render(hbs`<LoginForm />`);

    // then
    assert.dom(screen.getByRole('link', { name: 'Se connecter avec Google' })).exists();
  });
});
