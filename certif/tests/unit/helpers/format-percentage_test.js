import { module, test } from 'qunit';
import { formatPercentage } from 'pix-certif/helpers/format-percentage';

module('Unit | Helpers | format-percentage', function () {
  test('it truncate decimal places', function (assert) {
    // given
    const value = 0.2899999;

    // when
    const result = formatPercentage([value]);

    // then
    assert.strictEqual(result, '28 %');
  });

  test('it renders a percentage symbol', function (assert) {
    // given
    const value = 0.3;

    // when
    const result = formatPercentage([value]);

    // then
    assert.strictEqual(result, '30 %');
  });

  test('it renders an empty string if value is null', function (assert) {
    // given
    const value = null;

    // when
    const result = formatPercentage([value]);

    // then
    assert.strictEqual(result, '');
  });
});
