import { module, test } from 'qunit';
import { standardizeNumber, standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

module('Unit | Utility | standardizeNumber', function () {
  module('standardizeNumber', function () {
    const testData = [
      { number: 2, size: 2, expected: '02' },
      { number: 12, size: undefined, expected: '12' },
      { number: 12, size: 2, expected: '12' },
      { number: '042', size: undefined, expected: '42' },
      { number: '042', size: 4, expected: '0042' },
      { number: '40', size: undefined, expected: '40' },
    ];

    testData.forEach(({ number, size, expected }) => {
      test(`When number is ${number} with size ${size} it should return ${expected}`, function (assert) {
        assert.strictEqual(standardizeNumber(number, size), expected);
      });
    });
  });

  module('standardizeNumberInTwoDigitFormat', function () {
    const testData = [
      { number: 2, expected: '02' },
      { number: 12, expected: '12' },
      { number: '042', expected: '42' },
      { number: '40', expected: '40' },
    ];

    testData.forEach(({ number, expected }) => {
      test(`When number is ${number} it should return ${expected}`, function (assert) {
        assert.strictEqual(standardizeNumberInTwoDigitFormat(number), expected);
      });
    });
  });
});
