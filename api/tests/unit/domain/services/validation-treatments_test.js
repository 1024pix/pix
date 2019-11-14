const { expect } = require('../../../test-helper');
const { normalizeAndRemoveAccents, removeSpecialCharacters, applyPreTreatments, applyTreatments } = require('../../../../lib/domain/services/validation-treatments');

describe('Unit | Service | Validation Treatments', function() {

  describe('#normalizeAndRemoveAccents', function() {

    [
      { description: 'white spaces', input: '  foo  bar  ', expected: 'foobar' },
      { description: 'unbreakable spaces', input: 'unbreakable spaces', expected: 'unbreakablespaces' },
      { description: 'accents', input: 'àâäéèêëîïôöòûùüñń', expected: 'aaaeeeeiiooouuunn' },
      { description: 'cédille', input: 'hameçon', expected: 'hamecon' },
      { description: 'case', input: 'SHI-fu-Mi', expected: 'shi-fu-mi' }
    ].forEach((scenario) => {
      it(`should return the given string without "${scenario.description}"`, function() {
        expect(normalizeAndRemoveAccents(scenario.input)).to.equal(scenario.expected);
      });
    });

    it('should not modify æ and œ', function() {
      expect(normalizeAndRemoveAccents('æ/œ')).to.equal('æ/œ');
    });

    it('should return (a copy of) the given string unmodified if it contains no concerned characters', () => {
      expect(normalizeAndRemoveAccents('shi-foo-bar')).to.equal('shi-foo-bar');
    });

  });

  describe('#removeSpecialCharacters', function() {

    [
      { description: 'all point types', input: '?Allo?,:;.', expected: 'Allo' },
      { description: 'slashs', input: '\\o/', expected: 'o' },
      { description: 'quotes', input: '"quotes"', expected: 'quotes' },
      { description: 'underscore and dashes', input: 'Shi-fu_mi', expected: 'Shifumi' },
      { description: 'parenthesis', input: '(anyway)', expected: 'anyway' }
    ].forEach((scenario) => {
      it(`should return the given string without "${scenario.description}"`, function() {
        expect(removeSpecialCharacters(scenario.input)).to.equal(scenario.expected);
      });
    });

    it('should return (a copy of) the given string unmodified if it contains no concerned characters', () => {
      expect(removeSpecialCharacters('shi foo bar')).to.equal('shi foo bar');
    });

    it('should return the good result even for complex phrase', () => {
      expect(removeSpecialCharacters('Th!!is., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation')).to.equal('This is an example of a string with punctuation');
    });

  });

  /**
   * #applyPreTreatments(string)
   */

  describe('#applyPreTreatments', function() {

    it('should return a copy of the given string with unbreakable spaces replaced by normal spaces', () => {
      // given
      const stringWithUnbreakableSpaces = ' Shi Foo-Bar ';
      const sameStringWithNormalSpaces = ' Shi Foo-Bar ';

      // when
      const actual = applyPreTreatments(stringWithUnbreakableSpaces);

      // then
      expect(actual).to.equal(sameStringWithNormalSpaces);
    });
  });

  /**
   * #applyTreatments(string, enabledTreatments)
   */

  describe('#applyTreatments', () => {

    const input = ' Shi Foo-Bar ';

    it('should return the given string without applying any treatment when the enabled treatments array is not defined', () => {
      expect(applyTreatments(input)).to.equal(input);
    });

    it('should return the given string without applying any treatment when the enabled treatments array is empty', () => {
      expect(applyTreatments(input, [])).to.equal(input);
    });

    it('should return the given string without applying any treatment when the enabled treatments array does not contain "t1" nor "t2"', () => {
      expect(applyTreatments(input, ['t1000'])).to.equal(input);
    });

    it('should return a string with "t1" applied if it is set as enabled treatment', () => {
      expect(applyTreatments(input, ['t1'])).to.equal('shifoo-bar');
    });

    it('should return a string with "t2" applied if it is set as enabled treatment', () => {
      expect(applyTreatments(input, ['t2'])).to.equal(' Shi FooBar ');
    });
  });

});
