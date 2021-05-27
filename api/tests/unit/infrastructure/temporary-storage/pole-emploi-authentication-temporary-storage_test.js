const redis = require('redis');
const { expect, sinon } = require('../../../test-helper');

const PoleEmploiAuthenticationTemporaryStorage = require('../../../../lib/infrastructure/temporary-storage/pole-emploi-authentication-temporary-storage');

describe('Unit | Infrastructure | PoleEmploiAuthenticationTemporaryStorage', () => {

  const KEY_PREFIX = 'authentication_';

  describe('#constructor', () => {

    it('should instantiate a redis client', async () => {
      // given
      sinon.stub(redis, 'createClient');
      redis.createClient.returns({
        del: () => {},
        get: () => {},
        set: () => {},
      });

      // when
      new PoleEmploiAuthenticationTemporaryStorage();

      // then
      expect(redis.createClient).to.have.been.calledOnce;
    });
  });

  describe('#getdel', () => {

    it('should call _get method with prefixed key', async () => {
      // given
      const key = 'my_key';
      const storage = new PoleEmploiAuthenticationTemporaryStorage();
      const getStub = sinon.stub(storage, '_get');

      // when
      await storage.getdel(key);

      // then
      expect(getStub).to.have.been.calledWith(KEY_PREFIX + key);
    });

    it('should call _del method with prefixed key', async () => {
      // given
      const key = 'my_key';
      const storage = new PoleEmploiAuthenticationTemporaryStorage();
      const delStub = sinon.stub(storage, '_del');

      // when
      await storage.getdel(key);

      // then
      expect(delStub).to.have.been.calledWith(KEY_PREFIX + key);
    });
  });

  describe('#set', () => {

    it('should call _set method with prefixed key, value and an expiration delay', async () => {
      // given
      const key = 'my_key';
      const value = 'value';
      const expirationDelaySeconds = 10;
      const storage = new PoleEmploiAuthenticationTemporaryStorage();
      const setStub = sinon.stub(storage, '_set');

      // when
      await storage.set(key, value);

      // then
      expect(setStub).to.have.been.calledWith(KEY_PREFIX + key, value, 'EX', expirationDelaySeconds);
    });
  });
});
