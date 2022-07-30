import { module, test } from 'qunit';
import textWithMultipleLang from 'mon-pix/helpers/text-with-multiple-lang';

module('Unit | Helper | text with multiple lang', function (hooks) {
  let textWithMultipleLangHelper;

  hooks.beforeEach(function () {
    textWithMultipleLangHelper = new textWithMultipleLang();
    textWithMultipleLangHelper.intl = { locales: ['fr', 'en'] };
  });
  [
    { text: 'des mots', lang: 'fr', outputText: 'des mots' },
    { text: 'des mots', lang: null, outputText: 'des mots' },
    { text: null, lang: 'fr', outputText: null },
    { text: '[fr]des mots', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'notexist', outputText: 'des motssome words' },
  ].forEach((expected) => {
    test(`should return the text "${expected.outputText}" if the text is "${expected.text}" in lang ${expected.lang}`, function (assert) {
      textWithMultipleLangHelper.intl.t = () => expected.lang;

      assert.equal(textWithMultipleLangHelper.compute([expected.text, expected.lang]), expected.outputText);
    });
  });
});
