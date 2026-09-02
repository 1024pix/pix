import { setupTest } from 'ember-qunit';
import { maxBy, minBy, orderBy, pick, sum, sumBy } from 'pix-orga/utils/collection';
import { module, test } from 'qunit';

module('Unit | Utils | collection', function (hooks) {
  setupTest(hooks);
  module('sum', function () {
    test('it correctly sums an array of numbers', function (assert) {
      const numbers = [1, 2, 3, 4, 5];
      const result = sum(numbers);
      assert.strictEqual(result, 15, 'Sum of [1, 2, 3, 4, 5] should be 15');
    });

    test('it returns 0 for an empty array', function (assert) {
      const numbers: number[] = [];
      const result = sum(numbers);
      assert.strictEqual(result, 0, 'Sum of an empty array should be 0');
    });
  });

  module('sumBy', function () {
    test('it correctly sums a property of an array of objects', function (assert) {
      const items = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }];
      const result = sumBy(items, 'value');
      assert.strictEqual(result, 15, 'Sum of values should be 15');
    });

    test('it returns 0 for an empty array', function (assert) {
      const items: { value: number }[] = [];
      const result = sumBy(items, 'value');
      assert.strictEqual(result, 0, 'Sum of an empty array should be 0');
    });
  });
  module('minBy', function () {
    test('it returns the object with the minimum value for a numeric property', function (assert) {
      const items = [
        { id: 1, value: 10 },
        { id: 2, value: 5 },
        { id: 3, value: 8 },
      ];
      const result = minBy(items, 'value');
      assert.strictEqual(result, items[1], 'Should return the object with the minimum value');
    });

    test('it returns the object with the minimum value for a date property', function (assert) {
      const items = [
        { id: 1, date: new Date('2023-01-01') },
        { id: 2, date: new Date('2022-01-01') },
        { id: 3, date: new Date('2024-01-01') },
      ];
      const result = minBy(items, 'date');
      assert.strictEqual(result, items[1], 'Should return the object with the earliest date');
    });

    test('it returns null for an empty array', function (assert) {
      const items: { value: number }[] = [];
      const result = minBy(items, 'value');
      assert.strictEqual(result, null, 'Should return null for empty array');
    });

    test('it handles arrays with one item', function (assert) {
      const items = [{ id: 1, value: 10 }];
      const result = minBy(items, 'value');
      assert.strictEqual(result, items[0], 'Should return the single item');
    });
  });

  module('maxBy', function () {
    test('it returns the object with the maximum value for a numeric property', function (assert) {
      const items = [
        { id: 1, value: 10 },
        { id: 2, value: 15 },
        { id: 3, value: 8 },
      ];
      const result = maxBy(items, 'value');
      assert.strictEqual(result, items[1], 'Should return the object with the maximum value');
    });

    test('it returns the object with the maximum value for a date property', function (assert) {
      const items = [
        { id: 1, date: new Date('2023-01-01') },
        { id: 2, date: new Date('2022-01-01') },
        { id: 3, date: new Date('2024-01-01') },
      ];
      const result = maxBy(items, 'date');
      assert.strictEqual(result, items[2], 'Should return the object with the latest date');
    });

    test('it returns null for an empty array', function (assert) {
      const items: { value: number }[] = [];
      const result = maxBy(items, 'value');
      assert.strictEqual(result, null, 'Should return null for empty array');
    });

    test('it handles arrays with one item', function (assert) {
      const items = [{ id: 1, value: 10 }];
      const result = maxBy(items, 'value');
      assert.strictEqual(result, items[0], 'Should return the single item');
    });
  });

  module('orderBy', function () {
    test('it sorts objects by a single numeric property in ascending order', function (assert) {
      const items = [
        { id: 1, value: 10 },
        { id: 2, value: 5 },
        { id: 3, value: 8 },
      ];
      const result = orderBy(items, 'value');
      assert.deepEqual(result, [items[1], items[2], items[0]], 'Should sort by value in ascending order');
    });

    test('it sorts objects by a single numeric property in descending order', function (assert) {
      const items = [
        { id: 1, value: 10 },
        { id: 2, value: 5 },
        { id: 3, value: 8 },
      ];
      const result = orderBy(items, 'value', 'desc');
      assert.deepEqual(result, [items[0], items[2], items[1]], 'Should sort by value in descending order');
    });

    test('it sorts objects by a date property in ascending order', function (assert) {
      const items = [
        { id: 1, date: new Date('2023-01-01') },
        { id: 2, date: new Date('2022-01-01') },
        { id: 3, date: new Date('2024-01-01') },
      ];
      const result = orderBy(items, 'date');
      assert.deepEqual(result, [items[1], items[0], items[2]], 'Should sort by date in ascending order');
    });

    test('it sorts objects by multiple properties', function (assert) {
      const items = [
        { id: 1, first: 'b', second: 2 },
        { id: 2, first: 'a', second: 1 },
        { id: 3, first: 'b', second: 1 },
      ];
      const result = orderBy(items, ['first', 'second']);
      assert.deepEqual(result, [items[1], items[2], items[0]], 'Should sort by first then second property');
    });

    test('it sorts objects by multiple properties with different orders', function (assert) {
      const items = [
        { id: 1, first: 'b', second: 2 },
        { id: 2, first: 'a', second: 1 },
        { id: 3, first: 'b', second: 1 },
      ];
      const result = orderBy(items, ['first', 'second'], ['asc', 'desc']);
      assert.deepEqual(result, [items[1], items[0], items[2]], 'Should sort by first asc then second desc');
    });

    test('it returns an empty array for empty input', function (assert) {
      const items: { value: number }[] = [];
      const result = orderBy(items, 'value');
      assert.deepEqual(result, [], 'Should return empty array for empty input');
    });

    test('it handles string properties correctly', function (assert) {
      const items = [
        { id: 1, name: 'Charlie' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
      ];
      const result = orderBy(items, 'name');
      assert.deepEqual(result, [items[1], items[2], items[0]], 'Should sort strings alphabetically');
    });
  });

  module('pick', function () {
    test('it picks specified properties from the source object', function (assert) {
      const source = { id: 1, name: 'John', age: 30, city: 'New York' };
      const result = pick(source, ['name', 'age']);
      assert.deepEqual(result, { name: 'John', age: 30 }, 'Should pick name and age properties');
    });

    test('it returns an empty object when no properties are specified', function (assert) {
      const source = { id: 1, name: 'John', age: 30 };
      const result = pick(source, []);
      assert.deepEqual(result, {}, 'Should return an empty object');
    });

    test('it returns an empty object when source is empty', function (assert) {
      const source = {};
      const result = pick(source, ['name', 'age']);
      assert.deepEqual(result, {}, 'Should return an empty object');
    });

    test('it ignores properties that do not exist in the source', function (assert) {
      const source = { id: 1, name: 'John' };
      const result = pick(source, ['name', 'age']);
      assert.deepEqual(result, { name: 'John' }, 'Should only pick existing properties');
    });

    test('it handles undefined and null values correctly', function (assert) {
      const source = { id: 1, name: undefined, age: null };
      const result = pick(source, ['name', 'age']);
      assert.deepEqual(result, { name: undefined, age: null }, 'Should pick properties with undefined and null values');
    });
  });
});
