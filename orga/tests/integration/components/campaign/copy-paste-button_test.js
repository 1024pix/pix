import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | Campaign::CopyPasteButton', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  const successMessage = 'Ouiiiiiii !';
  const defaultMessage = 'Ivre il clique sur le bouton et ....';
  test('it displays the default message', async function (assert) {
    this.successMessage = successMessage;
    this.defaultMessage = defaultMessage;

    await render(hbs`<Campaign::CopyPasteButton
  @clipboardText='textToCopy'
  @successMessage={{this.successMessage}}
  @defaultMessage={{this.defaultMessage}}
/>`);

    assert.contains(defaultMessage);
  });
});
