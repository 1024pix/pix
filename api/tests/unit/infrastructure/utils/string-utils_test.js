import { expect } from '../../../test-helper';

import {
  isNumeric,
  cleanStringAndParseFloat,
  getArrayOfStrings,
  splitIntoWordsAndRemoveBackspaces,
  normalizeAndSortChars,
  normalize,
  toArrayOfFixedLengthStringsConservingWords,
} from '../../../../lib/infrastructure/utils/string-utils';

describe('Unit | Utils | string-utils', function () {
  const zeroWidthSpaceChar = '​';

  describe('#isNumeric', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { case: 'abc', expectedResult: false },
      { case: '123', expectedResult: true },
      { case: '12.0', expectedResult: true },
      { case: '13,0', expectedResult: true },
      { case: 'abc.0', expectedResult: false },
      { case: 'abc.c', expectedResult: false },
      { case: '123.a', expectedResult: false },
      { case: '123.897', expectedResult: true },
      { case: '123.000', expectedResult: true },
      { case: '0.123', expectedResult: true },
      { case: '0,123', expectedResult: true },
      { case: '25 000', expectedResult: true },
    ].forEach((data) => {
      it(`should return ${data.expectedResult} with ${data.case}`, function () {
        // When
        const result = isNumeric(data.case);
        // Then
        expect(result).to.be.equal(data.expectedResult);
      });
    });
  });

  describe('#cleanStringAndParseFloat', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { case: '0123', expectedResult: 123 },
      { case: '1,23', expectedResult: 1.23 },
      { case: '01,23', expectedResult: 1.23 },
      { case: '1.23', expectedResult: 1.23 },
      { case: '1.00', expectedResult: 1.0 },
      { case: '1.00', expectedResult: 1 },
      { case: '00025 000', expectedResult: 25000 },
    ].forEach((data) => {
      it(`should return ${data.expectedResult} with ${data.case}`, function () {
        // When
        const result = cleanStringAndParseFloat(data.case);
        // Then
        expect(result).to.be.equal(data.expectedResult);
      });
    });
  });

  describe('#splitIntoWordsAndRemoveBackspaces', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { case: 'abc', expectedResult: ['abc'] },
      { case: 'qvak\nqwak\nanything\n', expectedResult: ['qvak', 'qwak', 'anything'] },
      { case: 'wîth àccénts êêê', expectedResult: ['wîth àccénts êêê'] },
      { case: ',.!p-u-n-c-t', expectedResult: [',.!p-u-n-c-t'] },
      { case: 'variant 1\nvariant 2\nvariant 3\n', expectedResult: ['variant 1', 'variant 2', 'variant 3'] },
    ].forEach((data) => {
      it(`should return ${data.expectedResult} with ${data.case}`, function () {
        // When
        const result = splitIntoWordsAndRemoveBackspaces(data.case);
        // Then
        expect(result).to.be.deep.equal(data.expectedResult);
      });
    });
  });

  describe('#normalizeAndSortChars', function () {
    it(`should normalize and sort chars of a string with non canonical, zero-width and special characters: "Féd '. 4àBç - 2 (îHg)K${zeroWidthSpaceChar}J"`, function () {
      expect(normalizeAndSortChars("Féd '. 4àBç - 2 (îHg)K​J")).to.equal('24ABCDEFGHIJK');
    });
  });

  describe('#normalize', function () {
    it(`should normalize chars of a string with non canonical, zero-width and special characters: "Féd '. 4àBç - 2 (îHg)K${zeroWidthSpaceChar}J"`, function () {
      expect(normalize("Féd '. 4àBç - 2 (îHg)K​J")).to.equal('FED4ABC2IHGKJ');
    });
  });

  describe('#getArrayOfStrings', function () {
    context('given value is undefined', function () {
      it('should return an empty array', function () {
        // when
        const array = getArrayOfStrings(undefined);

        // then
        expect(array).to.be.empty;
      });
    });

    context('given value has only one string', function () {
      it('should return array of 1', function () {
        // when
        const array = getArrayOfStrings('un');

        // then
        expect(array).to.deep.equal(['UN']);
      });
    });

    context('given value has more than one string', function () {
      it('should return an array containing the strings, trimmed and uppercase', function () {
        // when
        const array = getArrayOfStrings('un, dos');

        // then
        expect(array).to.deep.equal(['UN', 'DOS']);
      });
    });
  });

  describe('#toArrayOfFixedLengthStringsConservingWords', function () {
    it('should return an array containing an empty string when string parameter is empty', function () {
      // given
      const stringToSplit = '';

      // when
      const result = toArrayOfFixedLengthStringsConservingWords(stringToSplit, 10);

      // then
      expect(result).to.deep.equal(['']);
    });

    it('should return an array containing the string parameter when maxLength is lower or equal to string length', function () {
      // given
      const stringToSplit = 'Ceci est un test';

      // when
      const result = toArrayOfFixedLengthStringsConservingWords(stringToSplit, 16);

      // then
      expect(result).to.deep.equal(['Ceci est un test']);
    });

    it('should return an array of limited length strings conserving word', function () {
      // given
      const stringToSplit = 'Ceci est une chaîne de caractère permettant de tester la fonction.';

      // when
      const result = toArrayOfFixedLengthStringsConservingWords(stringToSplit, 10);

      // then
      expect(result).to.deep.equal([
        'Ceci est',
        'une chaîne',
        'de',
        'caractère',
        'permettant',
        'de tester',
        'la',
        'fonction.',
      ]);
    });
  });
});
