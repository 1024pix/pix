import { htmlSafe } from '@ember/template';
import TextWithMultipleLang from 'pix-orga/helpers/text-with-multiple-lang';
import { module, test } from 'qunit';

module('Unit | Helper | TextWithMultipleLang', function (hooks) {
  let helper: TextWithMultipleLang;
  hooks.beforeEach(function () {
    helper = new TextWithMultipleLang();
  });

  [
    { text: 'des mots', lang: 'fr', outputText: 'des mots' },
    { text: null, lang: 'fr', outputText: '' },
    { text: '[fr]des mots', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'notexist', outputText: 'des motssome words' },
    { text: htmlSafe('<div>une phrase</div>'), lang: 'fr', outputText: '<div>une phrase</div>' },
    {
      text: htmlSafe('[fr]<div>une phrase</div>[/fr][en]<div>one string</div>[/en]'),
      lang: 'en',
      outputText: '<div>one string</div>',
    },
  ].forEach((expected) => {
    test(`should return the text "${expected.outputText}" if the text is "${String(expected.text)}" in lang ${expected.lang}`, function (assert) {
      // given
      helper.locale = {
        currentLanguage: expected.lang,
        availableLocales: ['fr', 'en'],
      };

      // when
      const computedText = helper.compute([expected.text]).toString();

      // then
      assert.strictEqual(computedText, expected.outputText);
    });
  });
});
