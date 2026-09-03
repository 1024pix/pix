import { expect } from 'chai';

import { InMemoryKeyValueStorage } from '../../../../../src/shared/infrastructure/key-value-storages/InMemoryKeyValueStorage.js';

describe('Unit | Infrastructure | key-value-storage | InMemoryKeyValueStorage', function () {
  let inMemoryKeyValueStorage;

  beforeEach(function () {
    inMemoryKeyValueStorage = new InMemoryKeyValueStorage();
  });

  describe('#increment', function () {
    it('should call client incr to increment value', async function () {
      // given
      const key = 'valueKey';
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();

      // when
      await inMemoryKeyValueStorage.increment(key);

      // then
      expect(await inMemoryKeyValueStorage.get(key)).to.equal('1');
    });
  });

  describe('#decrement', function () {
    it('should call client incr to decrement value', async function () {
      // given
      const key = 'valueKey';
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();

      // when
      await inMemoryKeyValueStorage.decrement(key);

      // then
      expect(await inMemoryKeyValueStorage.get(key)).to.equal('-1');
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
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const key = await inMemoryKeyValueStorage.save({ value, expirationDelaySeconds });

      // when
      const result = await inMemoryKeyValueStorage.get(key);

      // then
      expect(result).to.deep.equal(value);
    });
  });

  describe('#update', function () {
    it('should set a new value', async function () {
      // given
      const key = await inMemoryKeyValueStorage.save({
        value: { name: 'name' },
      });

      // when
      await inMemoryKeyValueStorage.update(key, { url: 'url' });

      // then
      const result = await inMemoryKeyValueStorage.get(key);
      expect(result).to.deep.equal({ url: 'url' });
    });
  });

  describe('#delete', function () {
    it('should delete the value if it exists', async function () {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const key = await inMemoryKeyValueStorage.save({ value, expirationDelaySeconds });

      // when
      await inMemoryKeyValueStorage.delete(key);

      // then
      const savedKey = await inMemoryKeyValueStorage.get(key);
      expect(savedKey).to.be.undefined;
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
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();

      // when
      const length = await inMemoryKeyValueStorage.lpush('key:lpush', 'value');

      // then
      expect(length).to.equal(1);
    });
  });

  describe('#lrem', function () {
    it('should remove values into key list', async function () {
      // given
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();

      // when
      const key = 'key:lrem';
      await inMemoryKeyValueStorage.lpush(key, 'value1');
      await inMemoryKeyValueStorage.lpush(key, 'value2');
      await inMemoryKeyValueStorage.lpush(key, 'value1');

      const length = await inMemoryKeyValueStorage.lrem(key, 'value1');

      // then
      expect(length).to.equal(2);
    });
  });

  describe('#lrange', function () {
    it('should return key values list', async function () {
      // given
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();

      // when
      const key = 'key:lrange';
      await inMemoryKeyValueStorage.lpush(key, 'value1');
      await inMemoryKeyValueStorage.lpush(key, 'value2');
      await inMemoryKeyValueStorage.lpush(key, 'value3');

      const values = await inMemoryKeyValueStorage.lrange(key);

      // then
      expect(values).to.have.lengthOf(3);
      expect(values).to.deep.equal(['value3', 'value2', 'value1']);
    });
  });

  describe('#keys', function () {
    it('should return matching keys', async function () {
      // given
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();
      inMemoryKeyValueStorage.save({ key: 'prefix:key1', value: true });
      inMemoryKeyValueStorage.save({ key: 'prefix:key2', value: true });
      inMemoryKeyValueStorage.save({ key: 'prefix:key3', value: true });
      inMemoryKeyValueStorage.save({ key: 'otherprefix:key4', value: true });

      // when
      const values = inMemoryKeyValueStorage.keys('prefix:*');

      // then
      expect(values).to.deep.equal(['prefix:key1', 'prefix:key2', 'prefix:key3']);
    });

    it('should return matching keys for all keys', async function () {
      // given
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();
      inMemoryKeyValueStorage.save({ key: 'prefix:key1', value: true });
      inMemoryKeyValueStorage.save({ key: 'prefix:key2', value: true });
      inMemoryKeyValueStorage.save({ key: 'prefix:key3', value: true });
      inMemoryKeyValueStorage.save({ key: 'otherprefix:key4', value: true });

      // when
      const values = inMemoryKeyValueStorage.keys('*');

      // then
      expect(values).to.deep.equal(['prefix:key1', 'prefix:key2', 'prefix:key3', 'otherprefix:key4']);
    });
  });
});
