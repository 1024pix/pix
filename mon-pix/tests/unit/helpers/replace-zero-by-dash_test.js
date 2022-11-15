import { module, test } from 'qunit';
import { replaceZeroByDash } from 'mon-pix/helpers/replace-zero-by-dash';

module('Unit | Helpers | replaceZeroByDash', function () {
  test('does not change null values', function (assert) {
    const value = replaceZeroByDash([null]);
    assert.equal(value, null);
  });

  test('does not change number non-zero values', function (assert) {
    const value1 = replaceZeroByDash([1]);
    const value2 = replaceZeroByDash([111]);
    const value3 = replaceZeroByDash([0.0001]);
    assert.equal(value1, 1);
    assert.equal(value2, 111);
    assert.equal(value3, 0.0001);
  });

  test('replaces zero by dash', function (assert) {
    const value = replaceZeroByDash([0]);
    assert.equal(value, '–');
  });
});
