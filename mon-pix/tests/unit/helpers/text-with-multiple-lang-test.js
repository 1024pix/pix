import { expect } from 'chai';
import { describe, it } from 'mocha';
import { textWithMultipleLang } from 'mon-pix/helpers/text-with-multiple-lang';

describe('Unit | Helper | text with multiple lang', function() {
  [
    { text: 'des mots', lang: 'fr', outputText: 'des mots' },
    { text: 'des mots', lang: null, outputText: 'des mots' },
    { text: '[fr]des mots', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'fr', outputText: 'des mots' },
    { text: '[fr]des mots[/fr][en]some words[/en]', lang: 'en', outputText: 'some words' },
  ].forEach((expected) => {
    it(`should return the text "${expected.outputText}" if the text is "${expected.text}" in lang ${expected.lang}`, function() {
      expect(textWithMultipleLang([expected.text, expected.lang])).to.equal(expected.outputText);
    });
  });
});
