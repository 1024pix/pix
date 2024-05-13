import { pshuffle } from 'junior/utils/pshuffle';
import { module, test } from 'qunit';

import { setupTest } from '../../helpers/index';

module('Unit | Utils | PShuffle', function (hooks) {
  setupTest(hooks);

  test('shuffles keep all elements of given array', function (assert) {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    pshuffle(array);

    assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], array.sort());
  });

  test('shuffles the given array', function (assert) {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    pshuffle(array);

    assert.notDeepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], array);
  });

  test('shuffles stably with the same seed', function (assert) {
    const arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const arr2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    pshuffle(arr1, 456);
    pshuffle(arr2, 456);

    assert.deepEqual(arr1, arr2);
  });

  test('shuffles differently with a different seed', function (assert) {
    const arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const arr2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    pshuffle(arr1, 789);
    pshuffle(arr2, 987);

    assert.notDeepEqual(arr1, arr2);
  });

  test('shuffles works with null', function (assert) {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    pshuffle(arr, null);

    assert.notDeepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], arr);
  });

  test('shuffles works with undefined', function (assert) {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    pshuffle(arr, undefined);

    assert.notDeepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], arr);
  });

  test('shuffles works with an negative seed', function (assert) {
    const arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const arr2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    pshuffle(arr1, 456);
    pshuffle(arr2, -456);

    assert.deepEqual(arr1, arr2);
  });

  test('shuffles works with a seed equal 0', function (assert) {
    const shuffledArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const notShuffledArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    pshuffle(shuffledArray, 0);

    assert.notDeepEqual(shuffledArray, notShuffledArray);
  });

  test('shuffles works with a seed equal 1', function (assert) {
    const shuffledArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const notShuffledArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    pshuffle(shuffledArray, 1);

    assert.notDeepEqual(shuffledArray, notShuffledArray);
  });
});
