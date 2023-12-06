import { module, test } from 'qunit';
import textWithMultipleLang from 'pix-orga/helpers/text-with-multiple-lang';
import { htmlSafe } from '@ember/template';

module('Unit | Helper | TextWithMultipleLang', function (hooks) {
  let helper;
  hooks.beforeEach(function () {
    helper = new textWithMultipleLang();
    helper.intl = { locales: ['fr', 'en'] };
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
    test(`should return the text "${expected.outputText}" if the text is "${expected.text}" in lang ${expected.lang}`, function (assert) {
      // given
      helper.intl.primaryLocale = expected.lang;

      // when
      const computedText = helper.compute([expected.text]).toString();

      // then
      assert.strictEqual(computedText, expected.outputText);
    });
  });
});
