import { expect } from 'chai';
import { describe, it } from 'mocha';
import valueAsArrayOfBoolean from 'pix-live/utils/value-as-array-of-boolean';

describe('Unit | Utility | value as array of boolean', function() {
  // Replace this with your real tests.
  const testData = [
    { when: 'Empty String', input: '', expected: [] },
    { when: 'Wrong type as input', input: new Date(), expected: [] },
    { when: 'Undefined input', input: undefined, expected: [] },
    { when: 'Nominal case', input: '2,3', expected: [false, true, true] },
    { when: 'Only one value', input: '4', expected: [false, false, false, true] },
    { when: 'Resist to order, empty space and empty value', input: ',4, 2 , 2,1,  ,', expected: [true, true, false, true] },

  ];

  testData.forEach(({ when, input, expected }) => {

    it(`"${when}", example : "${JSON.stringify(input)}" retourne [${expected}]`, function() {
      expect(valueAsArrayOfBoolean(input)).to.deep.equal(expected);
    });
  });
});
