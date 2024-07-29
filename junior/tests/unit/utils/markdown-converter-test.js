import * as markdownConverter from 'junior/utils/markdown-converter';
import { module, test } from 'qunit';

import { setupTest } from '../../helpers/index';

module('Unit | Utils | MarkdownConverter', function (hooks) {
  setupTest(hooks);

  test('keep text without markdown symbols', function (assert) {
    const text = 'un simple texte';
    const expectedText = '<p>un simple texte</p>';

    const resultText = markdownConverter.toHTML(text);

    assert.strictEqual(expectedText, resultText);
  });

  test('text with bold', function (assert) {
    const text = 'un texte **gras**';
    const expectedText = '<p>un texte <strong>gras</strong></p>';

    const resultText = markdownConverter.toHTML(text);

    assert.strictEqual(expectedText, resultText);
  });
});
