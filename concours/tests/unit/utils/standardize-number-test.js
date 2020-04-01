import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  standardizeNumber,
  standardizeNumberInTwoDigitFormat
} from 'mon-pix/utils/standardize-number';

describe('Unit | Utility | standardizeNumber', function() {

  describe('standardizeNumber', function() {
    const testData = [
      { number: 2, size: 2, expected: '02' },
      { number: 12, size: undefined, expected: '12' },
      { number: 12, size: 2, expected: '12' },
      { number: '042', size: undefined, expected: '42' },
      { number: '042', size: 4, expected: '0042' },
      { number: '40', size: undefined, expected: '40' },
    ];

    testData.forEach(({ number, size, expected }) => {

      it(`When number is ${number} with size ${size} it should return ${expected}`, function() {
        expect(standardizeNumber(number, size)).to.equal(expected);
      });
    });
  });

  describe('standardizeNumberInTwoDigitFormat', function() {
    const testData = [
      { number: 2, expected: '02' },
      { number: 12, expected: '12' },
      { number: '042', expected: '42' },
      { number: '40', expected: '40' },
    ];

    testData.forEach(({ number, expected }) => {

      it(`When number is ${number} it should return ${expected}`, function() {
        expect(standardizeNumberInTwoDigitFormat(number)).to.equal(expected);
      });
    });
  });
});
