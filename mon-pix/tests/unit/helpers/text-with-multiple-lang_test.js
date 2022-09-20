import { expect } from 'chai';
import { describe, it } from 'mocha';
import textWithMultipleLang from 'mon-pix/helpers/text-with-multiple-lang';
import { htmlSafe } from '@ember/string';

describe('Unit | Helper | text with multiple lang', function () {
  let textWithMultipleLangHelper;

  beforeEach(function () {
    textWithMultipleLangHelper = new textWithMultipleLang();
    textWithMultipleLangHelper.intl = { locales: ['fr', 'en'] };
  });
  [
    { text: 'des mots', lang: 'fr', outputText: 'des mots' },
    { text: 'des mots', lang: null, outputText: 'des mots' },
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
    it(`should return the text "${expected.outputText}" if the text is "${expected.text}" in lang ${expected.lang}`, function () {
      textWithMultipleLangHelper.intl.t = () => expected.lang;

      expect(textWithMultipleLangHelper.compute([expected.text, expected.lang]).toString()).to.equal(
        expected.outputText
      );
    });
  });
});
