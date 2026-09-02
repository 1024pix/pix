import { SessionStorageEntry } from 'pix-orga/utils/session-storage-entry';
import { module, test } from 'qunit';

module('Unit | Utilities | SessionStorageEntry', function () {
  test('sets and gets a string value', function (assert) {
    // given
    const entry = new SessionStorageEntry('testKey');
    const value = 'testValue';

    // when
    entry.set(value);

    // then
    assert.strictEqual(entry.get(), value);
  });

  test('sets and gets a number value', function (assert) {
    // given
    const entry = new SessionStorageEntry('numberKey');
    const value = 123;

    // when
    entry.set(value);

    // then
    assert.strictEqual(entry.get(), value);
  });

  test('sets and gets a boolean value', function (assert) {
    // given
    const entry = new SessionStorageEntry('booleanKey');
    const value = true;

    // when
    entry.set(value);

    // then
    assert.strictEqual(entry.get(), value);
  });

  test('sets and gets a null value', function (assert) {
    // given
    const entry = new SessionStorageEntry('nullKey');
    const value = null;

    // when
    entry.set(value);

    // then
    assert.strictEqual(entry.get(), value);
  });

  test('returns undefined for a non-existing key', function (assert) {
    // given
    const entry = new SessionStorageEntry('nonExistingKey');

    // when
    const result = entry.get();

    // then
    assert.strictEqual(result, undefined);
  });

  test('removes a key', function (assert) {
    // given
    const entry = new SessionStorageEntry('testKey');
    const value = 'testValue';
    entry.set(value);

    // when
    entry.remove();

    // then
    assert.strictEqual(entry.get(), undefined);
  });
});
