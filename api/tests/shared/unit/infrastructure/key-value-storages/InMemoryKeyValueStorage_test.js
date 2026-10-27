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

  describe('#hset', function () {
    it('adds a field to a hash', async function () {
      // given
      const key = 'someKey';
      const field = 'someField';
      const value = 'value';

      // when
      await inMemoryKeyValueStorage.hset(key, field, value);

      // then
      expect(store.get(key)).to.deep.equal(new Map([[field, value]]));
    });

    describe('when hash already has some fields', function () {
      it('adds a field to a existing hash', async function () {
        // given
        const key = 'someKey';
        const field = 'someField';
        const value = 'value';
        store.set(
          key,
          new Map([
            ['existingField1', 1],
            ['existingField2', 2],
          ]),
        );

        // when
        await inMemoryKeyValueStorage.hset(key, field, value);

        // then
        expect(store.get(key)).to.deep.equal(
          new Map([
            ['existingField1', 1],
            ['existingField2', 2],
            [field, value],
          ]),
        );
      });
    });
  });

  describe('#hkeys', function () {
    it('lists all fields of a hash', async function () {
      // given
      const key = 'someKey';
      const hash = new Map([
        ['field1', 1],
        ['field2', 2],
        ['field3', 3],
      ]);
      store.set(key, hash);

      // when
      const result = await inMemoryKeyValueStorage.hkeys(key);

      // then
      expect(result?.toSorted()).to.deep.equal(['field1', 'field2', 'field3']);
    });

    describe('when key does not exist', function () {
      it('returns empty array', async function () {
        // given
        const key = 'someKey';

        // when
        const result = await inMemoryKeyValueStorage.hkeys(key);

        // then
        expect(result).to.deep.equal([]);
      });
    });
  });

  describe('#hgetall', function () {
    it('returns an object with all hash values', async function () {
      // given
      const key = 'someKey';
      const hash = new Map([
        ['field1', 1],
        ['field2', 2],
        ['field3', 3],
      ]);
      store.set(key, hash);

      // when
      const result = await inMemoryKeyValueStorage.hgetall(key);

      // then
      expect(result).to.deep.equal({
        field1: 1,
        field2: 2,
        field3: 3,
      });
    });

    describe('when key does not exist', function () {
      it('returns empty array', async function () {
        // given
        const key = 'someKey';

        // when
        const result = await inMemoryKeyValueStorage.hgetall(key);

        // then
        expect(result).to.deep.equal({});
      });
    });
  });

  describe('#hdel', function () {
    it('adds a field to a existing hash', async function () {
      // given
      const key = 'someKey';
      const hash = new Map([
        ['field1', 1],
        ['field2', 2],
        ['field3', 3],
      ]);
      store.set(key, hash);

      // when
      await inMemoryKeyValueStorage.hdel(key, 'field1', 'field3');

      // then
      expect(store.get(key)).to.deep.equal(new Map([['field2', 2]]));
    });

    describe('when key does not exist', function () {
      it('does nothing', async function () {
        // given
        const key = 'someKey';

        // when
        await inMemoryKeyValueStorage.hdel(key, 'field1', 'field3');

        // then
        expect(store.get(key)).to.be.undefined;
      });
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
