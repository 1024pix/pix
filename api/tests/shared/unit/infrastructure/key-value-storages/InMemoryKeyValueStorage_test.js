import sinon from 'sinon';

import { InMemoryKeyValueStorage } from '../../../../../src/shared/infrastructure/key-value-storages/InMemoryKeyValueStorage.js';
import { expect } from '../../../../test-helper.js';

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
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers();
    });

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

    it('should save key value with a defined ttl in seconds', async function () {
      // given
      const TWO_MINUTES_IN_SECONDS = 2 * 60;

      // when
      const key = await inMemoryKeyValueStorage.save({
        value: 'foobar',
        expirationDelaySeconds: TWO_MINUTES_IN_SECONDS,
      });

      // then
      expect(await inMemoryKeyValueStorage.get(key)).to.equal('foobar');
      await clock.tickAsync(TWO_MINUTES_IN_SECONDS * 1000);
      expect(await inMemoryKeyValueStorage.get(key)).to.be.undefined;
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

    it('should not change the time to live', async function () {
      // given
      const clock = sinon.useFakeTimers();
      const keyWithTtl = await inMemoryKeyValueStorage.save({
        value: {},
        expirationDelaySeconds: 1,
      });
      const keyWithoutTtl = await inMemoryKeyValueStorage.save({ value: {} });

      // when
      await clock.tickAsync(500);
      await inMemoryKeyValueStorage.update(keyWithTtl, {});
      await inMemoryKeyValueStorage.update(keyWithoutTtl, {});
      await clock.tickAsync(600);

      // then
      expect(await inMemoryKeyValueStorage.get(keyWithTtl)).to.be.undefined;
      expect(await inMemoryKeyValueStorage.get(keyWithoutTtl)).not.to.be.undefined;
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
    it('should add an expiration time to the list', async function () {
      // given
      const clock = sinon.useFakeTimers();
      const inMemoryKeyValueStorage = new InMemoryKeyValueStorage();

      // when
      const key = 'key:lpush';
      await inMemoryKeyValueStorage.lpush(key, 'value');
      await inMemoryKeyValueStorage.expire({ key, expirationDelaySeconds: 1 });
      await clock.tickAsync(1200);
      const list = inMemoryKeyValueStorage.lrange(key);

      // then
      expect(list).to.be.empty;
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
