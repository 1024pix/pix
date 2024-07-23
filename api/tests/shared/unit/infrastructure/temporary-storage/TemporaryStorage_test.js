import { TemporaryStorage } from '../../../../../src/shared/infrastructure/temporary-storage/TemporaryStorage.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Infrastructure | temporary-storage | TemporaryStorage', function () {
  describe('#save', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#get', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.get('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#delete', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.delete('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#generateKey', function () {
    it('should return a key from static method', function () {
      // when
      const result = TemporaryStorage.generateKey();

      // then
      expect(result).to.be.ok;
    });
  });

  describe('#withPrefix', function () {
    let storage;
    let prefixedStorage;

    beforeEach(function () {
      class TestStorage extends TemporaryStorage {
        save = sinon.stub();
        get = sinon.stub();
        delete = sinon.stub();
        keys = sinon.stub();
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
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.update('key', 'value');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#quit', function () {
    it('should throw an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const call = () => temporaryStorageInstance.quit();

      // then
      expect(call).to.throw();
    });
  });

  describe('#ttl', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.ttl('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#expire', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.expire({ key: 'key', expirationDelaySeconds: 120 });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#lpush', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.lpush({ key: 'key', value: 'value' });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#lrem', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.lrem({ key: 'key', valueToRemove: 'valueToRemove' });

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#lrange', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.lrange('key');

      // then
      expect(result).to.be.rejected;
    });
  });

  describe('#keys', function () {
    it('should reject an error (because this class actually mocks an interface)', function () {
      // given
      const temporaryStorageInstance = new TemporaryStorage();

      // when
      const result = temporaryStorageInstance.keys('prefix:*');

      // then
      expect(result).to.be.rejected;
    });
  });
});
