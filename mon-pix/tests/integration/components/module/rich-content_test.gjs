import { render } from '@1024pix/ember-testing-library';
import { click, focus, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
import ModulixRichContent from 'mon-pix/components/module/rich-content';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | RichContent', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const modulixGlossary = this.owner.lookup('service:modulix-glossary');
    modulixGlossary.setEntries([{ word: 'chat', definition: 'Un petit félin domestique' }]);
  });

  test('should display html content', async function (assert) {
    // given
    const html = '<p>Un contenu sans glossaire</p>';

    // when
    const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);

    // then
    assert.ok(screen.getByText('Un contenu sans glossaire'));
    assert.strictEqual(screen.queryAllByRole('button').length, 0);
  });

  test('should display a button for each glossary marker, keeping the original text', async function (assert) {
    // given
    const html =
      '<p>Le <span data-glossary-word="chat">Chat</span> et le <span data-glossary-word="chat">chat</span></p>';

    // when
    const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);

    // then
    assert.ok(screen.getByRole('button', { name: 'Chat' }));
    assert.ok(screen.getByRole('button', { name: 'chat' }));
    assert.strictEqual(screen.queryAllByRole('tooltip').length, 0);
  });

  module('when hovering a glossary word with a mouse', function () {
    test('should display its definition', async function (assert) {
      // given
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      const button = screen.getByRole('button', { name: 'chat' });

      // when
      await triggerEvent(button, 'pointerenter', { pointerType: 'mouse' });

      // then
      const tooltip = screen.getByRole('tooltip');
      assert.dom(tooltip).hasText('Un petit félin domestique');
      assert.dom(button).hasAttribute('aria-describedby', tooltip.id);
      assert.dom(button).hasAttribute('aria-expanded', 'true');
    });

    test('should display a definition containing html', async function (assert) {
      // given
      const modulixGlossary = this.owner.lookup('service:modulix-glossary');
      modulixGlossary.setEntries([{ word: 'chat', definition: '<p>Un <strong>petit</strong> félin</p>' }]);
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);

      // when
      await triggerEvent(screen.getByRole('button', { name: 'chat' }), 'pointerenter', { pointerType: 'mouse' });

      // then
      const tooltip = screen.getByRole('tooltip');
      assert.dom(tooltip).hasText('Un petit félin');
      assert.dom(tooltip.querySelector('strong')).hasText('petit');
    });

    test('should hide its definition when the mouse leaves', async function (assert) {
      // given
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      const button = screen.getByRole('button', { name: 'chat' });
      await triggerEvent(button, 'pointerenter', { pointerType: 'mouse' });

      // when
      await triggerEvent(button, 'pointerleave', { pointerType: 'mouse' });

      // then
      assert.strictEqual(screen.queryAllByRole('tooltip').length, 0);
      assert.dom(button).hasAttribute('aria-expanded', 'false');
    });
  });

  module('when focusing a glossary word', function () {
    test('should display its definition until blur', async function (assert) {
      // given
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      const button = screen.getByRole('button', { name: 'chat' });

      // when
      await focus(button);

      // then
      assert.dom(screen.getByRole('tooltip')).hasText('Un petit félin domestique');
    });
  });

  module('when clicking a glossary word', function () {
    test('should keep its definition displayed after the mouse leaves', async function (assert) {
      // given
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      const button = screen.getByRole('button', { name: 'chat' });

      // when
      await click(button);
      await triggerEvent(button, 'pointerleave', { pointerType: 'mouse' });

      // then
      assert.dom(screen.getByRole('tooltip')).hasText('Un petit félin domestique');
    });

    test('should hide its definition on second click', async function (assert) {
      // given
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      const button = screen.getByRole('button', { name: 'chat' });
      await click(button);

      // when
      await click(button);

      // then
      assert.strictEqual(screen.queryAllByRole('tooltip').length, 0);
    });

    test('should hide its definition on Escape', async function (assert) {
      // given
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      await click(screen.getByRole('button', { name: 'chat' }));

      // when
      await triggerKeyEvent(document.body, 'keydown', 'Escape');

      // then
      assert.strictEqual(screen.queryAllByRole('tooltip').length, 0);
    });

    test('should hide its definition on outside interaction', async function (assert) {
      // given
      const html = '<p>Un <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      await click(screen.getByRole('button', { name: 'chat' }));

      // when
      await triggerEvent(document.body, 'pointerdown');

      // then
      assert.strictEqual(screen.queryAllByRole('tooltip').length, 0);
    });

    test('should display only one definition at a time', async function (assert) {
      // given
      const html =
        '<p>Le <span data-glossary-word="chat">Chat</span> et le <span data-glossary-word="chat">chat</span></p>';
      const screen = await render(<template><ModulixRichContent @html={{html}} /></template>);
      await click(screen.getByRole('button', { name: 'Chat' }));

      // when
      await click(screen.getByRole('button', { name: 'chat' }));

      // then
      assert.strictEqual(screen.getAllByRole('tooltip').length, 1);
      assert.dom(screen.getByRole('button', { name: 'Chat' })).hasAttribute('aria-expanded', 'false');
    });
  });
});
