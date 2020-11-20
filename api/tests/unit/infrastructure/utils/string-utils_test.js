const { expect } = require('../../../test-helper');
const { isNumeric } = require('../../../../lib/infrastructure/utils/string-utils');

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
});
