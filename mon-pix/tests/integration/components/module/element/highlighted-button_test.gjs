import { render } from '@1024pix/ember-testing-library';
import { click } from "@ember/test-helpers";
import ModuleElementText from 'mon-pix/components/module/element/text';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Highlighted Button', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when text contains a definition', function () {
    test('should display a highlighted button', async function (assert) {
      // given
      const definition = 'ouaf';
      const textElement = { content:
          `<p>Le chat, le <highlighted-button word="chien" definition="${definition}">chien</highlighted-button> et une souris</p>`,
        type: 'text',
        tag: ' '
      };

      //  when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      const button = screen.getByRole('button', { name: 'chien' });
      assert.dom(button).hasAttribute('aria-expanded', 'false');
      assert.dom(screen.queryByRole('tooltip', { name: definition})).doesNotExist();
    });



    module('when the highlighted button is clicked', function () {
      test('should display a modal with the definition', async function (assert) {
        // given
        const definition = "C'est que des emmerdes et à la fin tu meurs.";
        const textElement = { content:
            `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
          type: 'text',
          tag: ' '
        };

        //  when
        const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
        const button = screen.getByRole('button', { name: 'vie' });
        await click(button);

        // then
        assert.ok(screen.getByRole('tooltip', { name: definition}));
        assert.dom(button).hasAttribute('aria-expanded', 'true');
      });

      module('when the highlighted button is clicked again', function () {
        test('should hide the modal with the definition', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = { content:
              `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' '
          };

          //  when
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await click(button);
          await click(button);

          // then
          assert.dom(screen.queryByRole('tooltip', { name: definition})).doesNotExist();
          assert.dom(button).hasAttribute('aria-expanded', 'false');
        });
      });
    });
  });
});
