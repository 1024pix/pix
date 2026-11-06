import { render } from '@1024pix/ember-testing-library';
import { click, findAll } from "@ember/test-helpers";
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
