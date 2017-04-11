const { describe, it, expect } = require('../../../test-helper');
const { t1, t2, applyPreTreatments, applyTreatments } = require('../../../../lib/domain/services/validation-treatments');

describe('Unit | Service | Validation Treatments', function () {

  /**
   * #t1(string)
   */

  describe('#t1', function () {

    it('checks sanity', () => {
      expect(t1).to.exist;
    });

    [
      { description: 'white spaces', input: '  foo  bar  ', expected: 'foobar' },
      { description: 'unbreakable spaces', input: 'unbreakable spaces', expected: 'unbreakablespaces' },
      { description: 'accents', input: 'àâäéèêëîïôöòûùüñń', expected: 'aaaeeeeiiooouuunn' },
      { description: 'cédille', input: 'hameçon', expected: 'hamecon' },
      { description: 'case', input: 'SHI-fu-Mi', expected: 'shi-fu-mi' }
    ].forEach((scenario) => {
      it(`should return the given string without "${scenario.description}"`, function () {
        expect(t1(scenario.input)).to.equal(scenario.expected);
      });
    });

    it('should not modify æ and œ', function () {
      expect(t1('æ/œ')).to.equal('æ/œ');
    });

    it('should return (a copy of) the given string unmodified if it contains no concerned characters', () => {
      expect(t1('shi-foo-bar')).to.equal('shi-foo-bar');
    });

  });

  /**
   * #t2(string)
   */

  describe('#t2', function () {

    it('checks sanity', () => {
      expect(t2).to.exist;
    });

    [
      { description: 'all point types', input: '?Allo?,:;.', expected: 'Allo' },
      { description: 'slashs', input: '\\o/', expected: 'o' },
      { description: 'quotes', input: '"quotes"', expected: 'quotes' },
      { description: 'underscore and dashes', input: 'Shi-fu_mi', expected: 'Shifumi' },
      { description: 'parenthesis', input: '(anyway)', expected: 'anyway' }
    ].forEach((scenario) => {
      it(`should return the given string without "${scenario.description}"`, function () {
        expect(t2(scenario.input)).to.equal(scenario.expected);
      });
    });

    it('should return (a copy of) the given string unmodified if it contains no concerned characters', () => {
      expect(t2('shi foo bar')).to.equal('shi foo bar');
    });

    it('should return the good result even for complex phrase', () => {
      expect(t2('Th!!is., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation')).to.equal('This is an example of a string with punctuation');
    });

  });

  /**
   * #applyPreTreatments(string)
   */

  describe('#applyPreTreatments', function () {

    it('should return a copy of the given string with unbreakable spaces replaced by normal spaces', () => {
      // given
      const stringWithUnbreakableSpaces= ' Shi Foo-Bar ';
      const sameStringWithNormalSpaces= ' Shi Foo-Bar ';

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
