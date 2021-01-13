const { expect, sinon } = require('../../../test-helper');
const authenticationCache = require('../../../../lib/infrastructure/caches/authentication-cache');

describe('Unit | Infrastructure | Caches | AuthenticationCache', () => {

  beforeEach(() => {
    authenticationCache._cache = {
      get: sinon.stub(),
      set: sinon.stub(),
      flushAll: sinon.stub(),
    };
  });

  describe('#get', () => {

    it('should prefix key', async () => {
      // given
      const key = 'my_key';

      // when
      await authenticationCache.get(key);

      // then
      expect(authenticationCache._cache.get).to.have.been.calledWith('authentication_' + key);
    });
  });

  describe('#set', () => {

    it('should prefix key', async () => {
      // given
      const key = 'my_key';
      const value = 'value';

      // when
      await authenticationCache.set(key, value);

      // then
      expect(authenticationCache._cache.set).to.have.been.calledWith('authentication_' + key, value);
    });
  });
});
