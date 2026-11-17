import { render } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
import breakpoints from 'mon-pix/breakpoints';
import ModuleElementText from 'mon-pix/components/module/element/text';
import { module, test } from 'qunit';
import sinon from 'sinon';

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

    module('in desktop', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(window, 'matchMedia').callThrough().withArgs(breakpoints.mobile).returns({ matches: false });
      });

      hooks.afterEach(function () {
        sinon.restore();
      });

      module('when the highlighted button is hovered', function () {
        test('should display a tooltip with the definition', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = {
            content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' ',
          };

          //  when
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await triggerEvent(button, 'pointerenter');

          // then
          assert.ok(screen.getByRole('tooltip', { name: definition }));
          assert.dom(button).hasAttribute('aria-expanded', 'true');
        });

        module('when the highlighted button is no more hovered', function () {
          test('should hide the tooltip with the definition', async function (assert) {
            // given
            const definition = "C'est que des emmerdes et à la fin tu meurs.";
            const textElement = {
              content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
              type: 'text',
              tag: ' ',
            };

            //  when
            const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
            const button = screen.getByRole('button', { name: 'vie' });
            await triggerEvent(button, 'pointerenter');
            await triggerEvent(button, 'pointerleave');

            // then
            assert.dom(screen.queryByRole('tooltip', { name: definition })).doesNotExist();
            assert.dom(button).hasAttribute('aria-expanded', 'false');
          });
        });
      });
    });

    module('in mobile', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(window, 'matchMedia').callThrough().withArgs(breakpoints.mobile).returns({ matches: true });
      });

      hooks.afterEach(function () {
        sinon.restore();
      });

      module('when the highlighted button is clicked', function () {
        test('should display a tooltip with the definition', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = {
            content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' ',
          };

          //  when
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await click(button);

          // then
          assert.ok(
            screen.getByRole('tooltip', { name: "C'est que des emmerdes et à la fin tu meurs. Fermer la définition" }),
          );
          assert.dom(button).hasAttribute('aria-expanded', 'true');
        });

        test('should display a close button in tooltip', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = {
            content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' ',
          };

          //  when
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await click(button);

          // then
          const closeButton = screen.getByRole('button', { name: 'Fermer la définition' });
          assert.dom(closeButton).exists();
        });

        module('when the user clicks outside the highlighted button', function () {
          test('should hide the tooltip with the definition', async function (assert) {
            // given
            const definition = "C'est que des emmerdes et à la fin tu meurs.";
            const textElement = {
              content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
              type: 'text',
              tag: ' ',
            };

            //  when
            const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
            const button = screen.getByRole('button', { name: 'vie' });
            await click(button);
            await click(screen.getByText('est belle.', { exact: false }));

            // then
            assert.dom(screen.queryByRole('tooltip', { name: definition })).doesNotExist();
            assert.dom(button).hasAttribute('aria-expanded', 'false');
          });
        });

        module('when the user clicks on tooltip close button', function () {
          test('should hide the tooltip with the definition', async function (assert) {
            // given
            const definition = "C'est que des emmerdes et à la fin tu meurs.";
            const textElement = {
              content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
              type: 'text',
              tag: ' ',
            };

            //  when
            const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
            const button = screen.getByRole('button', { name: 'vie' });
            await click(button);
            const closeButton = screen.getByRole('button', { name: 'Fermer la définition' });
            await click(closeButton);

            // then
            assert.dom(screen.queryByRole('tooltip', { name: definition })).doesNotExist();
            assert.dom(button).hasAttribute('aria-expanded', 'false');
          });
        });
      });
    });

    module('in both', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(window, 'matchMedia').callThrough().withArgs(breakpoints.mobile).returns({ matches: false });
      });

      hooks.afterEach(function () {
        sinon.restore();
      });

      module('when the highlighted button is focused', function () {
        test('should display a tooltip with the definition', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = {
            content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' ',
          };

          //  when
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await triggerEvent(button, 'focus');

          // then
          assert.ok(screen.getByRole('tooltip', { name: definition }));
          assert.dom(button).hasAttribute('aria-expanded', 'true');
        });

        module('when the highlighted button is focused and blur', function () {
          test('should hide the tooltip with the definition', async function (assert) {
            // given
            const definition = "C'est que des emmerdes et à la fin tu meurs.";
            const textElement = {
              content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
              type: 'text',
              tag: ' ',
            };

            //  when
            const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
            const button = screen.getByRole('button', { name: 'vie' });
            await triggerEvent(button, 'focus');
            await triggerEvent(button, 'blur');

            // then
            assert.dom(screen.queryByRole('tooltip', { name: definition })).doesNotExist();
            assert.dom(button).hasAttribute('aria-expanded', 'false');
          });
        });
      });

      module('when the page is scrolled while the tooltip is displayed', function () {
        test('should reposition the tooltip', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = {
            content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' ',
          };
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await triggerEvent(button, 'focus');
          const tooltip = screen.getByRole('tooltip', { name: definition });
          sinon.stub(button, 'getBoundingClientRect').returns({ top: 100, bottom: 120, left: 42, right: 60 });
          sinon.stub(tooltip, 'getBoundingClientRect').returns({ top: 0, left: 0, width: 100, height: 50 });

          // when
          await triggerEvent(window, 'scroll');

          // then
          assert.strictEqual(tooltip.style.left, '42px');
          assert.strictEqual(tooltip.style.top, '128px');
          sinon.restore();
        });
      });

      module('when the page is scrolled after the tooltip is hidden', function () {
        test('should not reposition the tooltip', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = {
            content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' ',
          };
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await triggerEvent(button, 'focus');
          await triggerEvent(button, 'blur');
          const getBoundingClientRectSpy = sinon.spy(button, 'getBoundingClientRect');

          // when
          await triggerEvent(window, 'scroll');

          // then
          assert.ok(getBoundingClientRectSpy.notCalled);
          sinon.restore();
        });
      });

      module('when the tooltip is inside a transformed ancestor (horizontal stepper)', function () {
        test('should position the tooltip relative to the ancestor instead of the viewport', async function (assert) {
          // given
          const definition = "C'est que des emmerdes et à la fin tu meurs.";
          const textElement = {
            content: `<p>La <highlighted-button word="vie" definition="${definition}">vie</highlighted-button> est belle.</p>`,
            type: 'text',
            tag: ' ',
          };
          const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
          const button = screen.getByRole('button', { name: 'vie' });
          await triggerEvent(button, 'focus');
          const tooltip = screen.getByRole('tooltip', { name: definition });
          sinon.stub(button, 'getBoundingClientRect').returns({ top: 100, bottom: 120, left: 42, right: 60 });
          sinon.stub(tooltip, 'getBoundingClientRect').returns({ top: 30, left: -500, width: 100, height: 50 });

          // when
          await triggerEvent(window, 'scroll');

          // then
          assert.strictEqual(tooltip.style.left, '542px');
          assert.strictEqual(tooltip.style.top, '98px');
          sinon.restore();
        });
      });
    });
  });

  module('when word contains escaped HTML', function () {
    test('should render the word as text', async function (assert) {
      // given
      const textElement = {
        content: `<p><highlighted-button word="x" definition="def">&lt;img src=x onerror=alert(1)&gt;</highlighted-button></p>`,
        type: 'text',
        tag: ' ',
      };

      // when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      assert.ok(screen.getByRole('button', { name: '<img src=x onerror=alert(1)>' }));
      assert.dom('highlighted-button img').doesNotExist();
    });
  });
});
