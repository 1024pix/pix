const { expect } = require('../../../test-helper');
const { isNumeric, cleanStringAndParseFloat, splitIntoWordsAndRemoveBackspaces } = require('../../../../lib/infrastructure/utils/string-utils');

describe('Unit | Utils | string-utils', () => {
  describe('isNumeric', () => {
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
      it(`should return ${data.expectedResult} with ${data.case}`, () => {
        // When
        const result = isNumeric(data.case);
        // Then
        expect(result).to.be.equal(data.expectedResult);
      });
    });
  });

  describe('cleanStringAndParseFloat', () => {
    [
      { case: '0123', expectedResult: 123 },
      { case: '1,23', expectedResult: 1.23 },
      { case: '01,23', expectedResult: 1.23 },
      { case: '1.23', expectedResult: 1.23 },
      { case: '1.00', expectedResult: 1.00 },
      { case: '1.00', expectedResult: 1 },
      { case: '00025 000', expectedResult: 25000 },
    ].forEach((data) => {
      it(`should return ${data.expectedResult} with ${data.case}`, () => {
        // When
        const result = cleanStringAndParseFloat(data.case);
        // Then
        expect(result).to.be.equal(data.expectedResult);
      });
    });
  });

  describe('splitIntoWordsAndRemoveBackspaces', () => {
    [
      { case: 'abc', expectedResult: ['abc'] },
      { case: 'qvak\nqwak\nanything\n', expectedResult: [ 'qvak', 'qwak', 'anything' ] },
      { case: 'wîth àccénts êêê', expectedResult: [ 'wîth àccénts êêê' ] },
      { case: ',.!p-u-n-c-t', expectedResult: [ ',.!p-u-n-c-t' ] },
      { case: 'variant 1\nvariant 2\nvariant 3\n', expectedResult: [ 'variant 1', 'variant 2', 'variant 3' ] },
    ].forEach((data) => {
      it(`should return ${data.expectedResult} with ${data.case}`, () => {
        // When
        const result = splitIntoWordsAndRemoveBackspaces(data.case);
        // Then
        expect(result).to.be.deep.equal(data.expectedResult);
      });
    });
  });
});
