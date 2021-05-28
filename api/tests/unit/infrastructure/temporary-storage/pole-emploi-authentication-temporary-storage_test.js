const redis = require('redis');
const { expect, sinon } = require('../../../test-helper');

const storage = require('../../../../lib/infrastructure/temporary-storage/pole-emploi-authentication-temporary-storage');

describe('Unit | Infrastructure | PoleEmploiAuthenticationTemporaryStorage', () => {

  const KEY_PREFIX = 'authentication_';

  describe('#getdel', () => {

    it('should call _get method with prefixed key', async () => {
      // given
      const key = 'my_key';
      const getStub = sinon.stub(storage, '_get');

      // when
      await storage.getdel(key);

      // then
      expect(getStub).to.have.been.calledWith(KEY_PREFIX + key);
    });

    it('should call _del method with prefixed key', async () => {
      // given
      const key = 'my_key';
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
      const setStub = sinon.stub(storage, '_set');

      // when
      await storage.set(key, value);

      // then
      expect(setStub).to.have.been.calledWith(KEY_PREFIX + key, value, 'EX', expirationDelaySeconds);
    });
  });
});
