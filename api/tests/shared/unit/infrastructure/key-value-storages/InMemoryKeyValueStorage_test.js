import { expect } from 'chai';

import { InMemoryKeyValueStorage } from '../../../../../src/shared/infrastructure/key-value-storages/InMemoryKeyValueStorage.js';

describe('Unit | Infrastructure | key-value-storage | InMemoryKeyValueStorage', function () {
  let store, inMemoryKeyValueStorage;

  beforeEach(function () {
    store = new Map();
    inMemoryKeyValueStorage = new InMemoryKeyValueStorage({ store });
  });

  describe('#increment', function () {
    it('should call client incr to increment value', async function () {
      // given
      const key = 'valueKey';

      // when
      await inMemoryKeyValueStorage.increment(key);

      // then
      expect(store.get(key)).to.equal('1');
    });
  });

  describe('#decrement', function () {
    it('should call client incr to decrement value', async function () {
      // given
      const key = 'valueKey';

      // when
      await inMemoryKeyValueStorage.decrement(key);

      // then
      expect(store.get(key)).to.equal('-1');
    });
  });

  describe('#save', function () {
    it('should resolve with the generated key', async function () {
      // when
      const key = await inMemoryKeyValueStorage.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(key).to.be.a.string;
    });

    it('should return a key from passed key parameter if valid', async function () {
      // given
      const keyParameter = 'KEY-PARAMETER';

      // when
      const returnedKey = await inMemoryKeyValueStorage.save({
        key: keyParameter,
        value: {},
        expirationDelaySeconds: 1000,
      });

      // then
      expect(returnedKey).to.be.equal(keyParameter);
    });

    it('should return a generated key if key parameter is not valid', async function () {
      // given
      const keyParameter = '  ';

      // when
      const returnedKey = await inMemoryKeyValueStorage.save({
        key: keyParameter,
        value: {},
        expirationDelaySeconds: 1000,
      });

      // then
      expect(returnedKey).not.be.equal(keyParameter);
    });
  });

  describe('#get', function () {
    it('should retrieve the value if it exists', async function () {
      // given
      const key = 'testkey';
      const value = { name: 'name' };
      store.set(key, value);

      // when
      const result = await inMemoryKeyValueStorage.get(key);

      // then
      expect(result).to.deep.equal(value);
    });
  });

  describe('#update', function () {
    it('should set a new value', async function () {
      // given
      const key = 'testkey';
      const value = { name: 'name' };
      store.set(key, value);

      // when
      await inMemoryKeyValueStorage.update(key, { url: 'url' });

      // then
      expect(store.get(key)).to.deep.equal({ url: 'url' });
    });
  });

  describe('#delete', function () {
    it('should delete the value if it exists', async function () {
      // given
      const key = 'testkey';
      const value = { name: 'name' };
      store.set(key, value);

      // when
      await inMemoryKeyValueStorage.delete(key);

      // then
      expect(store.has(key)).to.be.false;
    });
  });

  describe('#expire', function () {
    it('resolves', async function () {
      await inMemoryKeyValueStorage.expire('key');
    });
  });

  describe('#lpush', function () {
    it('should add value into key list', async function () {
      // given
      const key = 'key:lpush';
      const value = 'value';

      // when
      const length = await inMemoryKeyValueStorage.lpush('key:lpush', 'value');

      // then
      expect(length).to.equal(1);
      expect(store.get(key)).to.deep.equal([value]);
    });
  });

  describe('#lrem', function () {
    it('should remove values into key list', async function () {
      // given
      const key = 'key:lrem';
      store.set(key, ['value1', 'value2', 'value1']);

      // when
      const length = await inMemoryKeyValueStorage.lrem(key, 'value1');

      // then
      expect(length).to.equal(2);
      expect(store.get(key)).to.deep.equal(['value2']);
    });
  });

  describe('#lrange', function () {
    it('should return key values list', async function () {
      // given
      const key = 'key:lrange';
      store.set(key, ['value1', 'value2', 'value3']);

      // when
      const values = await inMemoryKeyValueStorage.lrange(key);

      // then
      expect(values).to.deep.equal(['value1', 'value2', 'value3']);
    });
  });

  describe('#keys', function () {
    it('should return matching keys', async function () {
      // given
      store.set('prefix:key1', true);
      store.set('prefix:key2', true);
      store.set('prefix:key3', true);
      store.set('otherprefix:key4', true);

      // when
      const values = inMemoryKeyValueStorage.keys('prefix:*');

      // then
      expect(values).to.deep.equal(['prefix:key1', 'prefix:key2', 'prefix:key3']);
    });

    it('should return matching keys for all keys', async function () {
      // given
      store.set('prefix:key1', true);
      store.set('prefix:key2', true);
      store.set('prefix:key3', true);
      store.set('otherprefix:key4', true);

      // when
      const values = await inMemoryKeyValueStorage.keys('*');

      // then
      expect(values).to.deep.equal(['prefix:key1', 'prefix:key2', 'prefix:key3', 'otherprefix:key4']);
    });
  });
});
