import sinon from 'sinon';

import { KeyValueStorage } from '../../../../../src/shared/infrastructure/key-value-storages/KeyValueStorage.js';

describe('Unit | Infrastructure | key-value-storage | KeyValueStorage', function () {
  describe('#save', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#decrement', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.decrement('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#increment', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.increment('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#get', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.get('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#delete', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.delete('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#generateKey', function () {
    it('should return a key from static method', function () {
      // when
      const result = KeyValueStorage.generateKey();

      // then
      expect(result).to.be.ok;
    });
  });

  describe('#withPrefix', function () {
    let storage;
    let prefixedStorage;

    beforeEach(function () {
      class TestStorage extends KeyValueStorage {
        save = sinon.stub();
        get = sinon.stub();
        delete = sinon.stub();
        keys = sinon.stub();
        increment = sinon.stub();
        decrement = sinon.stub();
      }

      storage = new TestStorage();
      prefixedStorage = storage.withPrefix('a-prefix:');
    });

    describe('#save', function () {
      it('should save a prefixed key', async function () {
        // when
        await prefixedStorage.save({ key: 'a-key', value: 'a-value' });

        // then
        expect(storage.save).to.have.been.calledOnceWith({ key: 'a-prefix:a-key', value: 'a-value' });
      });
    });

    describe('#get', function () {
      it('should fetch value of prefixed key', async function () {
        // given
        storage.get.withArgs('a-prefix:a-key').resolves('a-value');

        // when
        const value = await prefixedStorage.get('a-key');

        // then
        expect(value).to.equal('a-value');
      });
    });

    describe('#increment', function () {
      it('should increment value of prefixed key', async function () {
        // given
        storage.increment.resolves();

        // when
        await prefixedStorage.increment('a-key');

        // then
        expect(storage.increment).to.have.been.calledWithExactly('a-prefix:a-key');
      });
    });

    describe('#decrement', function () {
      it('should decrement value of prefixed key', async function () {
        // given
        storage.decrement.resolves();

        // when
        await prefixedStorage.decrement('a-key');

        // then
        expect(storage.decrement).to.have.been.calledWithExactly('a-prefix:a-key');
      });
    });

    describe('#delete', function () {
      it('should delete a prefixed key', async function () {
        // when
        await prefixedStorage.delete('a-key');

        // then
        expect(storage.delete).to.have.been.calledOnceWithExactly('a-prefix:a-key');
      });
    });

    describe('#keys', function () {
      it('should return keys matching prefixed pattern', async function () {
        // given
        storage.keys.withArgs('a-prefix:foo:*').resolves(['a-prefix:foo:key1', 'a-prefix:foo:key2']);

        // when
        const keys = await prefixedStorage.keys('foo:*');

        // then
        expect(keys).to.deep.equal(['foo:key1', 'foo:key2']);
      });
    });
  });

  describe('#update', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.update('key', 'value');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#quit', function () {
    it('should throw an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const call = () => keyValueStorageInstance.quit();

      // then
      expect(call).to.throw();
    });
  });

  describe('#ttl', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.ttl('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#expire', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.expire({ key: 'key', expirationDelaySeconds: 120 });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#lpush', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.lpush({ key: 'key', value: 'value' });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#lrem', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.lrem({ key: 'key', valueToRemove: 'valueToRemove' });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#lrange', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.lrange('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#keys', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const keyValueStorageInstance = new KeyValueStorage();

      // when
      const result = keyValueStorageInstance.keys('prefix:*');

      // then
      expect(result).to.be.rejected;
    });
  });
});
