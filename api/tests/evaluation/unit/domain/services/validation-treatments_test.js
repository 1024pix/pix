import {
  applyPreTreatments,
  applyTreatments,
  normalizeAndRemoveAccents,
  registerTreatment,
  removeSpecialCharacters,
  treatments,
} from '../../../../../src/evaluation/domain/services/validation-treatments.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Service | Validation Treatments', function () {
  describe('#normalizeAndRemoveAccents', function () {
    [
      { description: 'white spaces', input: '  foo  bar  ', expected: 'foobar' },
      { description: 'unbreakable spaces', input: 'unbreakable spaces', expected: 'unbreakablespaces' },
      { description: 'accents', input: 'àâäéèêëîïôöòûùüñń', expected: 'aaaeeeeiiooouuunn' },
      { description: 'cédille', input: 'hameçon', expected: 'hamecon' },
      { description: 'case', input: 'SHI-fu-Mi', expected: 'shi-fu-mi' },
    ].forEach((scenario) => {
      it(`should return the given string without "${scenario.description}"`, function () {
        expect(normalizeAndRemoveAccents(scenario.input)).to.equal(scenario.expected);
      });
    });

    it('should not modify æ and œ', function () {
      expect(normalizeAndRemoveAccents('æ/œ')).to.equal('æ/œ');
    });

    it('should return (a copy of) the given string unmodified if it contains no concerned characters', function () {
      expect(normalizeAndRemoveAccents('shi-foo-bar')).to.equal('shi-foo-bar');
    });
  });

  describe('#removeSpecialCharacters', function () {
    [
      { description: 'all point types', input: '?Allo?,:;.', expected: 'Allo' },
      { description: 'slashs', input: '\\o/', expected: 'o' },
      { description: 'quotes', input: '"quotes"', expected: 'quotes' },
      { description: 'underscore and dashes', input: 'Shi-fu_mi', expected: 'Shifumi' },
      { description: 'parenthesis', input: '(anyway)', expected: 'anyway' },
    ].forEach((scenario) => {
      it(`should return the given string without "${scenario.description}"`, function () {
        expect(removeSpecialCharacters(scenario.input)).to.equal(scenario.expected);
      });
    });

    it('should return (a copy of) the given string unmodified if it contains no concerned characters', function () {
      expect(removeSpecialCharacters('shi foo bar')).to.equal('shi foo bar');
    });

    it('should return the good result even for complex phrase', function () {
      expect(
        removeSpecialCharacters('Th!!is., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation'),
      ).to.equal('This is an example of a string with punctuation');
    });
  });

  describe('#applyPreTreatments', function () {
    it('should return a copy of the given string with utf8 nfc normaliztion. \u0065\u0301 -> \u00e9', function () {
      // given
      const unnormalizedStr = '\u0065\u0301';
      const normalizedStr = '\u00e9';

      // when
      const actual = applyPreTreatments(unnormalizedStr);

      // then
      expect(actual).to.equal(normalizedStr);
    });

    it('should return a copy of the given string with unbreakable spaces replaced by normal spaces', function () {
      // given
      const stringWithUnbreakableSpaces = ' Shi Foo-Bar ';
      const sameStringWithNormalSpaces = ' Shi Foo-Bar ';

      // when
      const actual = applyPreTreatments(stringWithUnbreakableSpaces);

      // then
      expect(actual).to.equal(sameStringWithNormalSpaces);
    });
  });

  describe('#applyTreatments with enabled Treatments', function () {
    const input = ' Shi Foo-Bar ';

    it('should return the given string without applying any treatment when the enabled treatments array is not defined', function () {
      expect(applyTreatments(input)).to.equal(input);
    });

    it('should return the given string without applying any treatment when the enabled treatments array is empty', function () {
      expect(applyTreatments(input, [])).to.equal(input);
    });

    it('should return the given string without applying any treatment when the enabled treatments array does not contain "t1" nor "t2"', function () {
      expect(applyTreatments(input, ['t1000'])).to.equal(input);
    });

    it('should return a string with "t1" applied if it is set as enabled treatment', function () {
      expect(applyTreatments(input, ['t1'])).to.equal('shifoo-bar');
    });

    it('should return a string with "t2" applied if it is set as enabled treatment', function () {
      expect(applyTreatments(input, ['t2'])).to.equal(' Shi FooBar ');
    });
  });

  describe('#registerTreatment', function () {
    afterEach(function () {
      delete treatments.t4;
      delete treatments.testTreatment;
    });

    it('should register a new treatment function', function () {
      const customTreatment = (value) => value.toString().replace(/[0-9]/g, '');
      
      registerTreatment('t4', customTreatment);
      
      expect(treatments.t4).to.equal(customTreatment);
    });

    it('should allow the registered treatment to be used in applyTreatments', function () {
      const removeNumbers = (value) => value.toString().replace(/[0-9]/g, '');
      const input = 'test123string456';
      
      registerTreatment('testTreatment', removeNumbers);
      
      const result = applyTreatments(input, ['testTreatment']);
      expect(result).to.equal('teststring');
    });

    it('should override existing treatment when registering with same code', function () {
      const originalT1 = treatments.t1;
      const newT1Function = (value) => value.toString().toUpperCase();
      
      registerTreatment('t1', newT1Function);
      
      expect(treatments.t1).to.equal(newT1Function);
      expect(treatments.t1).to.not.equal(originalT1);
      
      treatments.t1 = originalT1;
    });

    it('should work with multiple registered treatments in applyTreatments', function () {
      const removeNumbers = (value) => value.toString().replace(/[0-9]/g, '');
      const removeVowels = (value) => value.toString().replace(/[aeiouAEIOU]/g, '');
      const input = 'test123string456';
      
      registerTreatment('t4', removeNumbers);
      registerTreatment('t5', removeVowels);
      
      const result = applyTreatments(input, ['t4', 't5']);
      expect(result).to.equal('tststrng');
      
      delete treatments.t5;
    });
  });
});
