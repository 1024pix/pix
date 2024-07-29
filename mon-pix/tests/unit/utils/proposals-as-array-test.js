import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import { module, test } from 'qunit';

module('Unit | Utility | proposals as array', function () {
  // Replace this with your real tests.
  const testData = [
    { data: '', expected: [] },
    { data: 'foo', expected: [] },
    { data: '- foo', expected: ['foo'] },
    { data: '-foo\n- bar', expected: ['foo', 'bar'] },
    { data: '- cerf-volant', expected: ['cerf-volant'] },
    { data: '- xi\n- foo mi', expected: ['xi', 'foo mi'] },
    { data: '- joli\n- cerf-volant', expected: ['joli', 'cerf-volant'] },
    { data: '- xi\n- foo\n- mi', expected: ['xi', 'foo', 'mi'] },
    { data: '-- foo', expected: ['- foo'] },
    { data: '- foo\n\r\t\n\r\t\n\r\t\n- bar', expected: ['foo', 'bar'] },
  ];

  testData.forEach(({ data, expected }) => {
    test(`"${data.toString()}" retourne [${expected}]`, function (assert) {
      assert.deepEqual(proposalsAsArray(data), expected);
    });
  });
});
