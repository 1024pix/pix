import { formatPercentage } from 'pix-certif/helpers/format-percentage';
import { module, test } from 'qunit';

module('Unit | Helpers | format-percentage', function () {
  [
    { value: 1.15, expectedResult: '115 %' },
    { value: 0.15, expectedResult: '15 %' },
    { value: 1.5, expectedResult: '150 %' },
  ].forEach(({ value, expectedResult }) =>
    test(`it renders a percentage ${expectedResult} for value ${value}`, function (assert) {
      // given
      // when
      const result = formatPercentage([value]);

      // then
      assert.strictEqual(result, expectedResult);
    }),
  );

  test('it renders an empty string if value is null', function (assert) {
    // given
    const value = null;

    // when
    const result = formatPercentage([value]);

    // then
    assert.strictEqual(result, '');
  });
});
