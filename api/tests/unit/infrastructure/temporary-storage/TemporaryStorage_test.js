import { expect } from '../../../test-helper';
import TemporaryStorage from '../../../../lib/infrastructure/temporary-storage/TemporaryStorage';

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
    it('should return a wrapper that adds a prefix to all methods', async function () {
      // given
      const store = {};

      class TestStorage extends TemporaryStorage {
        async save({ key, value }) {
          store[key] = value;
        }

        async get(key) {
          return store[key];
        }

        async delete(key) {
          delete store[key];
        }
      }

      const storage = new TestStorage().withPrefix('a-prefix:');

      // when & then
      expect(await storage.save({ key: 'a-key', value: 'a-value' })).to.equal('a-key');
      expect(store).to.deep.equal({ 'a-prefix:a-key': 'a-value' });

      expect(await storage.get('a-key')).to.equal('a-value');
      await storage.delete('a-key');
      expect(await storage.get('a-key')).to.be.undefined;

      const randomKey = await storage.save({ value: 'random-key-value' });
      expect(randomKey).to.exist;
      expect(store['a-prefix:' + randomKey]).to.exist;
      expect(await storage.get(randomKey)).to.equal('random-key-value');
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
});
