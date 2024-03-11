import { pshuffle } from 'mon-pix/utils/pshuffle';
import { module, test } from 'qunit';

const shuffleWithSeed = (arr, seed) => {
  pshuffle(arr, seed);
  return arr;
};

module('Unit | Utility | pshuffle', function () {
  test('shuffles the given array', function (assert) {
    const arr = shuffleWithSeed([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 123);

    assert.notDeepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepEqual(
      arr.sort((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });

  test('shuffles stably with the same seed', function (assert) {
    const arr1 = shuffleWithSeed([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 456);
    const arr2 = shuffleWithSeed([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 456);

    assert.deepEqual(arr1, arr2);
  });

  test('shuffles differently with a different seed', function (assert) {
    const arr1 = shuffleWithSeed([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 789);
    const arr2 = shuffleWithSeed([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 987);

    assert.notDeepEqual(arr1, arr2);
  });
});
