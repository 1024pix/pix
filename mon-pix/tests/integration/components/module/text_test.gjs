import { render } from '@1024pix/ember-testing-library';
import { click, findAll, focus, triggerKeyEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModuleElementText from 'mon-pix/components/module/element/text';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Text', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a Text', async function (assert) {
    // given
    const textElement = { content: 'content text', type: 'text', tag: ' ' };

    //  when
    const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-text').length, 1);
    assert.ok(screen.getByText('content text'));
  });

  module('glossary words', function () {
    test('should render highlighted words as native buttons', async function (assert) {
      // given
      const textElement = {
        content: '<p>Un <highlighted-button>écran</highlighted-button></p>',
        type: 'text',
        tag: ' ',
      };

      // when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      const button = screen.getByRole('button', { name: 'écran' });
      assert.strictEqual(button.tagName, 'BUTTON');
      assert.dom(button).hasAttribute('type', 'button');
      assert.dom(button).hasClass('module-glossary-word');
      assert.dom(button).hasAttribute('aria-haspopup', 'dialog');
    });

    test('should open glossary modal with selected word on click', async function (assert) {
      // given
      const glossaryModal = this.owner.lookup('service:modulix-glossary-modal');
      const textElement = {
        content: '<p>Un <highlighted-button>écran</highlighted-button></p>',
        type: 'text',
        tag: ' ',
      };
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // when
      await click(screen.getByRole('button', { name: 'écran' }));

      // then
      assert.true(glossaryModal.isBookModalOpen);
      assert.strictEqual(glossaryModal.selectedWord, 'écran');
    });

    module('when a definition is given', function () {
      const textElement = {
        content:
          '<p>Un <highlighted-button word="écran" definition="&lt;p&gt;Surface d’affichage&lt;/p&gt;">Écran</highlighted-button></p>',
        type: 'text',
        tag: ' ',
      };

      test('should describe the button with a hidden tooltip', async function (assert) {
        // when
        const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

        // then
        const button = screen.getByRole('button', { name: 'Écran', description: 'Surface d’affichage' });
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        assert.dom(button).hasAttribute('aria-describedby', tooltip.id);
        assert.dom(tooltip).hasText('Surface d’affichage');
        assert.dom(tooltip).doesNotHaveClass('module-glossary-tooltip--visible');
      });

      test('should show the tooltip on focus and hide it on Escape', async function (assert) {
        // given
        const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);
        const button = screen.getByRole('button', { name: 'Écran' });
        const tooltip = screen.getByRole('tooltip', { hidden: true });

        // when
        await focus(button);

        // then
        assert.dom(tooltip).hasClass('module-glossary-tooltip--visible');

        // when
        await triggerKeyEvent(button, 'keydown', 'Escape');

        // then
        assert.dom(tooltip).doesNotHaveClass('module-glossary-tooltip--visible');
      });

      test('should send the glossary word, not the displayed text, on click', async function (assert) {
        // given
        const glossaryModal = this.owner.lookup('service:modulix-glossary-modal');
        const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

        // when
        await click(screen.getByRole('button', { name: 'Écran' }));

        // then
        assert.strictEqual(glossaryModal.selectedWord, 'écran');
      });

      test('should not open the modal when clicking inside the tooltip', async function (assert) {
        // given
        const glossaryModal = this.owner.lookup('service:modulix-glossary-modal');
        const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

        // when
        await click(screen.getByRole('tooltip', { hidden: true }));

        // then
        assert.false(glossaryModal.isBookModalOpen);
      });
    });
  });

  module('tag display', function () {
    module('when tag value has only whitespace', function () {
      test('should not display the tag', async function (assert) {
        // given
        const textElement = { content: 'content text', type: 'text', tag: ' ' };

        // when
        await render(<template><ModuleElementText @text={{textElement}} /></template>);

        // then
        assert.dom('.pix-tag').doesNotExist();
      });
    });

    module('when tag value does not match the expected values', function () {
      test('should not display the tag', async function (assert) {
        // given
        const textElement = { content: 'content text', type: 'text', tag: 'hello !' };

        // when
        await render(<template><ModuleElementText @text={{textElement}} /></template>);

        // then
        assert.dom('.pix-tag').doesNotExist();
      });
    });

    test('should display a purple tag for "context"', async function (assert) {
      // given
      const textElement = { content: 'content text', type: 'text', tag: 'context' };

      // when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      assert.dom('.pix-tag--purple').exists();
      assert.ok(screen.getByText(t('pages.modulix.elements.text.tag.context')));
    });

    test('should display a blue-light tag for "tip"', async function (assert) {
      // given
      const textElement = { content: 'content text', type: 'text', tag: 'tip' };

      // when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      assert.dom('.pix-tag--blue-light').exists();
      assert.ok(screen.getByText(t('pages.modulix.elements.text.tag.tip')));
    });

    test('should display a blue-light tag for "further-information"', async function (assert) {
      // given
      const textElement = { content: 'content text', type: 'text', tag: 'further-information' };

      // when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      assert.dom('.pix-tag--blue-light').exists();
      assert.ok(screen.getByText(t('pages.modulix.elements.text.tag.further-information')));
    });

    test('should display a blue-light tag for "did-you-know"', async function (assert) {
      // given
      const textElement = { content: 'content text', type: 'text', tag: 'did-you-know' };

      // when
      const screen = await render(<template><ModuleElementText @text={{textElement}} /></template>);

      // then
      assert.dom('.pix-tag--blue-light').exists();
      assert.ok(screen.getByText(t('pages.modulix.elements.text.tag.did-you-know')));
    });
  });
});
