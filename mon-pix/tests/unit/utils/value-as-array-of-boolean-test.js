import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';
import { module, test } from 'qunit';

module('Unit | Utility | value as array of boolean', function () {
  // Replace this with your real tests.
  const testData = [
    { when: 'Empty String', input: '', expected: [] },
    { when: 'Wrong type as input', input: new Date(), expected: [] },
    { when: 'Undefined input', input: undefined, expected: [] },
    { when: 'Nominal case', input: '2,3', expected: [false, true, true] },
    { when: 'Only one value', input: '4', expected: [false, false, false, true] },
    {
      when: 'Big value',
      input: '11',
      expected: [false, false, false, false, false, false, false, false, false, false, true],
    },
    { when: 'Negative value', input: '-6', expected: [] },
    {
      when: 'Resist to order, empty space and empty value',
      input: ',4, 2 , 2,1,  ,',
      expected: [true, true, false, true],
    },
    { when: 'With specified length', input: '2,3', length: 5, expected: [false, true, true, false, false] },
  ];

  testData.forEach(({ when, input, length, expected }) => {
    test(`"${when}", example : "${JSON.stringify(input, length)}" retourne [${expected}]`, function (assert) {
      assert.deepEqual(valueAsArrayOfBoolean(input, length), expected);
    });
  });
});
