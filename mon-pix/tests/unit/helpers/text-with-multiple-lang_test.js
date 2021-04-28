import { expect } from 'chai';
import { describe, it } from 'mocha';
import textWithMultipleLang from 'mon-pix/helpers/text-with-multiple-lang';

describe('Unit | Helper | text with multiple lang', function() {
  let textWithMultipleLangHelper;

  beforeEach(function() {
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
    it(`should return the text "${expected.outputText}" if the text is "${expected.text}" in lang ${expected.lang}`, function() {
      textWithMultipleLangHelper.intl.t = () => expected.lang;

      expect(textWithMultipleLangHelper.compute([expected.text, expected.lang])).to.equal(expected.outputText);
    });
  });
});
