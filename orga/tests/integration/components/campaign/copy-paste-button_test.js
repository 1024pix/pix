import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Component | Campaign::CopyPasteButton', function (hooks) {
  setupRenderingTest(hooks);

  const successMessage = 'Ouiiiiiii !';
  const defaultMessage = 'Ivre il clique sur le bouton et ....';
  test('it displays the default message', async function (assert) {
    this.successMessage = successMessage;
    this.defaultMessage = defaultMessage;

    const screen = await render(hbs`<Campaign::CopyPasteButton
  @clipboardText='textToCopy'
  @successMessage={{this.successMessage}}
  @defaultMessage={{this.defaultMessage}}
/>`);

    assert.dom(screen.getByText(defaultMessage)).exists();
  });
});
