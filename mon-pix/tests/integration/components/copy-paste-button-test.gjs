import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import CopyPasteButton from 'mon-pix/components/copy-paste-button';
import { module, test } from 'qunit';

module('Integration | Component | CopyPasteButton', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: async () => {} },
      writable: true,
      configurable: true,
    });
  });

  const successMessage = 'Ouiiiiiii !';
  const defaultMessage = 'Ivre il clique sur le bouton et ....';
  test('it displays the default message', async function (assert) {
    const screen = await render(
      <template>
        <CopyPasteButton
          @clipboardText="textToCopy"
          @successMessage={{successMessage}}
          @defaultMessage={{defaultMessage}}
        />
      </template>,
    );

    assert.dom(screen.getByText(defaultMessage)).exists();
  });
});
