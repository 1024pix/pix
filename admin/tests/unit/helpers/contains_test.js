import { module, test } from 'qunit';
import { contains } from 'pix-admin/helpers/contains';

module('Unit | Helpers | contains', function () {
  test('it should return true when a value is included in an array', function (assert) {
    // given
    const value = 2;
    const array = [1, 2, 3];

    // when
    const result = contains([value, array]);

    // then
    assert.true(result);
  });

  test('it should return false when a value is not included in an array', function (assert) {
    // given
    const value = 4;
    const array = [1, 2, 3];

    // when
    const result = contains([value, array]);

    // then
    assert.false(result);
  });
});
