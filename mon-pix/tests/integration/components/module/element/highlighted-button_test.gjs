import { render } from '@1024pix/ember-testing-library';
import ModuleElementText from 'mon-pix/components/module/element/text';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Highlighted Button', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when text contains a term from the glossary', function () {
    test('should display a highlighted button', async function (assert) {
      // given
      const definition = 'ouaf';
      const textElement = {
        content: `<p>Le chat, le <highlighted-button word="chien" definition="${definition}">chien</highlighted-button> et une souris</p>`,
        type: 'text',
        tag: ' ',
      };

      //  when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      const button = screen.getByRole('button', { name: 'chien' });
      assert.dom(button).hasAttribute('aria-expanded', 'false');
      assert.dom(screen.queryByRole('tooltip', { name: definition })).doesNotExist();
    });
  });
});
